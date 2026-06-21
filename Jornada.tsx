import {
  type Journey,
  type Earning,
  type Expense,
  type Platform,
  type ExpenseCategory,
} from './types'
import {
  toISODate,
  monthKey,
  startOfWeekISO,
  startOfMonthISO,
  weekdayIndex,
} from './dates'

/** Formata número como moeda brasileira. */
export function formatBRL(value: number): string {
  return (value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/** Divisão segura: retorna 0 em vez de Infinity/NaN. */
export function safeDiv(a: number, b: number): number {
  if (!b || !isFinite(b)) return 0
  const r = a / b
  return isFinite(r) ? r : 0
}

// ---------------------------------------------------------------------
// Agregação por dia
// ---------------------------------------------------------------------
export interface DayAggregate {
  date: string
  earnings: number
  expenses: number
  profit: number
  hours: number
  km: number
  uber: number
  '99': number
}

function emptyDay(date: string): DayAggregate {
  return { date, earnings: 0, expenses: 0, profit: 0, hours: 0, km: 0, uber: 0, '99': 0 }
}

/** Constrói um mapa date -> agregado a partir dos dados brutos. */
export function buildDailyMap(
  journeys: Journey[],
  earnings: Earning[],
  expenses: Expense[],
): Map<string, DayAggregate> {
  const map = new Map<string, DayAggregate>()
  const get = (date: string) => {
    let d = map.get(date)
    if (!d) {
      d = emptyDay(date)
      map.set(date, d)
    }
    return d
  }

  for (const j of journeys) {
    // jornada é atribuída ao dia em que iniciou
    const date = toISODate(new Date(j.start_time))
    const d = get(date)
    d.hours += j.total_hours ?? 0
    d.km += j.total_km ?? 0
  }
  for (const e of earnings) {
    const d = get(e.date)
    d.earnings += e.amount
    d[e.platform] += e.amount
  }
  for (const x of expenses) {
    const d = get(x.date)
    d.expenses += x.amount
  }
  for (const d of map.values()) {
    d.profit = d.earnings - d.expenses
  }
  return map
}

// ---------------------------------------------------------------------
// Totais de um período (resumo + indicadores)
// ---------------------------------------------------------------------
export interface PeriodSummary {
  earnings: number
  expenses: number
  profit: number
  hours: number
  km: number
  workedDays: number
  ganhoPorKm: number
  lucroPorKm: number
  ganhoPorHora: number
  lucroPorHora: number
  ticketMedioDiario: number
}

export function summarize(days: DayAggregate[]): PeriodSummary {
  const s = days.reduce(
    (acc, d) => {
      acc.earnings += d.earnings
      acc.expenses += d.expenses
      acc.hours += d.hours
      acc.km += d.km
      if (d.earnings > 0 || d.hours > 0 || d.km > 0 || d.expenses > 0) acc.workedDays += 1
      return acc
    },
    { earnings: 0, expenses: 0, hours: 0, km: 0, workedDays: 0 },
  )
  const profit = s.earnings - s.expenses
  return {
    earnings: s.earnings,
    expenses: s.expenses,
    profit,
    hours: s.hours,
    km: s.km,
    workedDays: s.workedDays,
    ganhoPorKm: safeDiv(s.earnings, s.km),
    lucroPorKm: safeDiv(profit, s.km),
    ganhoPorHora: safeDiv(s.earnings, s.hours),
    lucroPorHora: safeDiv(profit, s.hours),
    ticketMedioDiario: safeDiv(s.earnings, s.workedDays),
  }
}

/** Filtra agregados por intervalo [from, to] inclusive (ISO). */
export function daysInRange(
  map: Map<string, DayAggregate>,
  fromISO: string,
  toISOdate: string,
): DayAggregate[] {
  const out: DayAggregate[] = []
  for (const d of map.values()) {
    if (d.date >= fromISO && d.date <= toISOdate) out.push(d)
  }
  return out.sort((a, b) => a.date.localeCompare(b.date))
}

export function summaryForToday(map: Map<string, DayAggregate>, today: string): PeriodSummary {
  return summarize(daysInRange(map, today, today))
}

export function summaryForWeek(map: Map<string, DayAggregate>, today: string): PeriodSummary {
  return summarize(daysInRange(map, startOfWeekISO(today), today))
}

export function summaryForMonth(map: Map<string, DayAggregate>, today: string): PeriodSummary {
  return summarize(daysInRange(map, startOfMonthISO(today), today))
}

// ---------------------------------------------------------------------
// Séries para os relatórios (Recharts)
// ---------------------------------------------------------------------
export interface PlatformSlice {
  name: string
  platform: Platform
  value: number
}

export function earningsByPlatform(earnings: Earning[]): PlatformSlice[] {
  const totals: Record<Platform, number> = { uber: 0, '99': 0 }
  for (const e of earnings) totals[e.platform] += e.amount
  return [
    { name: 'Uber', platform: 'uber' as Platform, value: totals.uber },
    { name: '99', platform: '99' as Platform, value: totals['99'] },
  ].filter((s) => s.value > 0)
}

export interface CategorySlice {
  name: string
  category: ExpenseCategory
  value: number
}

export function expensesByCategory(
  expenses: Expense[],
  labels: Record<ExpenseCategory, string>,
): CategorySlice[] {
  const totals = new Map<ExpenseCategory, number>()
  for (const x of expenses) totals.set(x.category, (totals.get(x.category) ?? 0) + x.amount)
  return [...totals.entries()]
    .map(([category, value]) => ({ name: labels[category], category, value }))
    .sort((a, b) => b.value - a.value)
}

/** Agrega por semana (segunda) ou por mês para os gráficos de evolução. */
export function groupBy(
  days: DayAggregate[],
  mode: 'week' | 'month',
): { key: string; earnings: number; expenses: number; profit: number }[] {
  const map = new Map<string, { earnings: number; expenses: number; profit: number }>()
  for (const d of days) {
    const key = mode === 'week' ? startOfWeekISO(d.date) : monthKey(d.date)
    const cur = map.get(key) ?? { earnings: 0, expenses: 0, profit: 0 }
    cur.earnings += d.earnings
    cur.expenses += d.expenses
    cur.profit += d.profit
    map.set(key, cur)
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => a.key.localeCompare(b.key))
}

// ---------------------------------------------------------------------
// Inteligência operacional
// ---------------------------------------------------------------------
export interface WeekdayStat {
  weekday: number
  name: string
  earnings: number
  profit: number
  days: number
  avgProfit: number
}

const WEEKDAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

/** Lucratividade por dia da semana, ordenada do mais lucrativo ao menos. */
export function weekdayRanking(days: DayAggregate[]): WeekdayStat[] {
  const acc = new Map<number, WeekdayStat>()
  for (const d of days) {
    if (d.earnings === 0 && d.profit === 0) continue
    const wd = weekdayIndex(d.date)
    const cur =
      acc.get(wd) ??
      { weekday: wd, name: WEEKDAY_NAMES[wd], earnings: 0, profit: 0, days: 0, avgProfit: 0 }
    cur.earnings += d.earnings
    cur.profit += d.profit
    cur.days += 1
    acc.set(wd, cur)
  }
  const list = [...acc.values()]
  for (const s of list) s.avgProfit = safeDiv(s.profit, s.days)
  return list.sort((a, b) => b.profit - a.profit)
}

export interface HourBucket {
  label: string
  from: number
  to: number
  earnings: number
}

const HOUR_BUCKETS: { label: string; from: number; to: number }[] = [
  { label: '00h–06h', from: 0, to: 6 },
  { label: '06h–09h', from: 6, to: 9 },
  { label: '09h–12h', from: 9, to: 12 },
  { label: '12h–15h', from: 12, to: 15 },
  { label: '15h–18h', from: 15, to: 18 },
  { label: '18h–21h', from: 18, to: 21 },
  { label: '21h–00h', from: 21, to: 24 },
]

/**
 * Ganhos por faixa horária. Usa earned_time quando informado.
 * Lançamentos sem hora ficam de fora deste relatório (mas seguem nos totais).
 */
export function hourlyRanking(earnings: Earning[]): { buckets: HourBucket[]; semHora: number } {
  const buckets: HourBucket[] = HOUR_BUCKETS.map((b) => ({ ...b, earnings: 0 }))
  let semHora = 0
  for (const e of earnings) {
    if (!e.earned_time) {
      semHora += e.amount
      continue
    }
    const hour = parseInt(e.earned_time.slice(0, 2), 10)
    const b = buckets.find((x) => hour >= x.from && hour < x.to)
    if (b) b.earnings += e.amount
  }
  return { buckets: [...buckets].sort((a, b) => b.earnings - a.earnings), semHora }
}

export interface BestDay {
  date: string
  value: number
}

/** Melhor dia por ganho/hora. */
export function bestGanhoPorHora(days: DayAggregate[]): BestDay | null {
  let best: BestDay | null = null
  for (const d of days) {
    if (d.hours <= 0) continue
    const v = d.earnings / d.hours
    if (!best || v > best.value) best = { date: d.date, value: v }
  }
  return best
}

/** Melhor dia por lucro/km. */
export function bestLucroPorKm(days: DayAggregate[]): BestDay | null {
  let best: BestDay | null = null
  for (const d of days) {
    if (d.km <= 0) continue
    const v = d.profit / d.km
    if (!best || v > best.value) best = { date: d.date, value: v }
  }
  return best
}

export interface WeeklyAverage {
  avgEarnings: number
  avgExpenses: number
  avgProfit: number
  weeks: number
}

/** Média por semana ao longo de todo o histórico. */
export function weeklyAverage(days: DayAggregate[]): WeeklyAverage {
  const byWeek = groupBy(days, 'week')
  const weeks = byWeek.length || 0
  const totals = byWeek.reduce(
    (a, w) => {
      a.earnings += w.earnings
      a.expenses += w.expenses
      a.profit += w.profit
      return a
    },
    { earnings: 0, expenses: 0, profit: 0 },
  )
  return {
    avgEarnings: safeDiv(totals.earnings, weeks),
    avgExpenses: safeDiv(totals.expenses, weeks),
    avgProfit: safeDiv(totals.profit, weeks),
    weeks,
  }
}
