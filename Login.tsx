import type { Journey, Earning, Expense, Platform, ExpenseCategory } from '../lib/types'
import { toISODate } from '../lib/dates'

// Gerador determinístico simples (mulberry32) para os dados sempre virem iguais.
function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const DAYS = 45 // últimos 45 dias

export function buildSeed(): { journeys: Journey[]; earnings: Earning[]; expenses: Expense[] } {
  const rand = rng(20260620)
  const journeys: Journey[] = []
  const earnings: Earning[] = []
  const expenses: Expense[] = []
  let km = 124000

  const now = new Date()

  for (let i = DAYS; i >= 0; i--) {
    const day = new Date(now)
    day.setDate(now.getDate() - i)
    const iso = toISODate(day)
    const weekday = day.getDay()

    // Folga em ~25% dos dias (mais em dom/seg)
    const restChance = weekday === 0 ? 0.55 : weekday === 1 ? 0.4 : 0.18
    if (rand() < restChance) continue

    // 1 ou 2 jornadas no dia
    const shifts = rand() < 0.45 ? 2 : 1
    let dayKm = 0
    let dayHours = 0

    const blocks =
      shifts === 2
        ? [
            { h: 7, dur: 4 },
            { h: 17, dur: 3.5 },
          ]
        : [{ h: 8 + Math.floor(rand() * 3), dur: 5 + rand() * 3 }]

    for (const b of blocks) {
      const start = new Date(day)
      start.setHours(b.h, Math.floor(rand() * 50), 0, 0)
      const durH = b.dur + (rand() - 0.5)
      const end = new Date(start.getTime() + durH * 3_600_000)
      const startKm = km
      const rodado = Math.round(40 + rand() * 70)
      km += rodado
      const endKm = km
      dayKm += rodado
      dayHours += durH

      journeys.push({
        id: uid(),
        user_id: 'demo',
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        start_km: startKm,
        end_km: endKm,
        total_km: rodado,
        total_hours: Number(durH.toFixed(2)),
        created_at: end.toISOString(),
      })

      // Ganhos espalhados pelo bloco — sexta/sábado rendem mais
      const boost = weekday === 5 || weekday === 6 ? 1.25 : 1
      const corridas = 4 + Math.floor(rand() * 5)
      for (let c = 0; c < corridas; c++) {
        const platform: Platform = rand() < 0.62 ? 'uber' : '99'
        const value = (9 + rand() * 32) * boost
        const t = new Date(start.getTime() + rand() * durH * 3_600_000)
        earnings.push({
          id: uid(),
          user_id: 'demo',
          date: iso,
          platform,
          amount: Number(value.toFixed(2)),
          earned_time: `${String(t.getHours()).padStart(2, '0')}:${String(
            t.getMinutes(),
          ).padStart(2, '0')}:00`,
          notes: null,
          created_at: t.toISOString(),
        })
      }
    }

    // Combustível quase todo dia rodado
    expenses.push({
      id: uid(),
      user_id: 'demo',
      date: iso,
      category: 'combustivel',
      amount: Number((dayKm * (0.42 + rand() * 0.1)).toFixed(2)),
      notes: rand() < 0.3 ? 'Tanque cheio' : null,
      created_at: iso,
    })

    // Gastos eventuais
    const extras: { cat: ExpenseCategory; chance: number; min: number; max: number }[] = [
      { cat: 'alimentacao', chance: 0.6, min: 12, max: 35 },
      { cat: 'pedagio', chance: 0.25, min: 6, max: 18 },
      { cat: 'estacionamento', chance: 0.18, min: 5, max: 15 },
      { cat: 'lavagem', chance: 0.08, min: 20, max: 40 },
      { cat: 'manutencao', chance: 0.05, min: 80, max: 350 },
    ]
    for (const e of extras) {
      if (rand() < e.chance) {
        expenses.push({
          id: uid(),
          user_id: 'demo',
          date: iso,
          category: e.cat,
          amount: Number((e.min + rand() * (e.max - e.min)).toFixed(2)),
          notes: null,
          created_at: iso,
        })
      }
    }

    void dayHours
  }

  journeys.sort((a, b) => b.start_time.localeCompare(a.start_time))
  earnings.sort((a, b) => b.date.localeCompare(a.date))
  expenses.sort((a, b) => b.date.localeCompare(a.date))
  return { journeys, earnings, expenses }
}
