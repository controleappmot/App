// Utilidades de data trabalhando sempre no fuso local do dispositivo,
// evitando o clássico bug de off-by-one ao usar new Date('yyyy-mm-dd').

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/** Data de hoje no formato yyyy-mm-dd (fuso local). */
export function todayISO(): string {
  return toISODate(new Date())
}

/** Converte um Date para yyyy-mm-dd respeitando o fuso local. */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Faz o parse de yyyy-mm-dd como data local (meia-noite local). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Formata yyyy-mm-dd como dd/mm. */
export function formatShortDate(iso: string): string {
  const d = parseISODate(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Formata yyyy-mm-dd como dd/mm/aaaa. */
export function formatFullDate(iso: string): string {
  const d = parseISODate(iso)
  return d.toLocaleDateString('pt-BR')
}

/** Nome do dia da semana (0 = Domingo) a partir de yyyy-mm-dd. */
export function weekdayName(iso: string): string {
  return WEEKDAYS[parseISODate(iso).getDay()]
}

export function weekdayShort(iso: string): string {
  return WEEKDAYS_SHORT[parseISODate(iso).getDay()]
}

export function weekdayIndex(iso: string): number {
  return parseISODate(iso).getDay()
}

/** Formata um timestamp ISO como HH:MM. */
export function formatTime(isoTs: string): string {
  return new Date(isoTs).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

/** Diferença em horas (decimal) entre dois timestamps ISO. */
export function hoursBetween(startIso: string, endIso: string): number {
  return (new Date(endIso).getTime() - new Date(startIso).getTime()) / 3_600_000
}

/** "2h 45min" a partir de horas decimais. */
export function formatDuration(hours: number): string {
  if (!isFinite(hours) || hours <= 0) return '0min'
  const totalMin = Math.round(hours * 60)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

/** Segunda-feira da semana de uma data (ISO). */
export function startOfWeekISO(iso: string): string {
  const d = parseISODate(iso)
  const day = d.getDay() // 0=Dom
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toISODate(d)
}

/** Primeiro dia do mês de uma data (ISO). */
export function startOfMonthISO(iso: string): string {
  const d = parseISODate(iso)
  return toISODate(new Date(d.getFullYear(), d.getMonth(), 1))
}

/** Rótulo "Jun/26" a partir de yyyy-mm. */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${months[m - 1]}/${String(y).slice(2)}`
}

/** yyyy-mm a partir de yyyy-mm-dd. */
export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}
