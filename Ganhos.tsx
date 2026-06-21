// Camada de demonstração: substitui o Supabase por dados em memória
// persistidos no localStorage. Ativada quando VITE_DEMO === '1'.
// Serve só para visualizar a interface sem banco de dados.

import type { Journey, Earning, Expense, Platform, ExpenseCategory } from './types'
import { toISODate } from './dates'

export const IS_DEMO = import.meta.env.VITE_DEMO === '1'

const KEY = 'rodometro-demo-v1'

interface Store {
  journeys: Journey[]
  earnings: Earning[]
  expenses: Expense[]
}

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Math.random().toString(36).slice(2)

// ---- gerador de dados de exemplo (últimos ~28 dias) ----
function seed(): Store {
  const journeys: Journey[] = []
  const earnings: Earning[] = []
  const expenses: Expense[] = []
  let km = 124000

  const rnd = (min: number, max: number) => min + Math.random() * (max - min)
  const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

  for (let back = 27; back >= 0; back--) {
    const day = new Date()
    day.setDate(day.getDate() - back)
    const dow = day.getDay() // 0=Dom
    const iso = toISODate(day)

    // folga em ~25% dos dias; domingo costuma render mais
    if (Math.random() < 0.25) continue

    const turnos = Math.random() < 0.45 ? 2 : 1
    let dayUber = 0
    let day99 = 0

    for (let t = 0; t < turnos; t++) {
      const startHour = t === 0 ? Math.floor(rnd(6, 11)) : Math.floor(rnd(16, 19))
      const durH = rnd(3, 5)
      const start = new Date(day)
      start.setHours(startHour, Math.floor(rnd(0, 59)), 0, 0)
      const end = new Date(start.getTime() + durH * 3_600_000)
      const tripKm = Math.round(rnd(45, 110))
      const startKm = km
      km += tripKm

      journeys.push({
        id: uid(),
        user_id: 'demo',
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        start_km: startKm,
        end_km: km,
        total_km: tripKm,
        total_hours: Number(durH.toFixed(2)),
        created_at: end.toISOString(),
      })

      // 2 a 4 ganhos por turno
      const nGanhos = Math.floor(rnd(2, 5))
      for (let g = 0; g < nGanhos; g++) {
        const plat: Platform = Math.random() < 0.62 ? 'uber' : '99'
        const val = Number(rnd(14, 55).toFixed(2))
        const h = Math.floor(rnd(startHour, startHour + durH))
        const hh = String(Math.min(23, h)).padStart(2, '0')
        const mm = String(Math.floor(rnd(0, 59))).padStart(2, '0')
        if (plat === 'uber') dayUber += val
        else day99 += val
        earnings.push({
          id: uid(),
          user_id: 'demo',
          date: iso,
          platform: plat,
          amount: val,
          earned_time: `${hh}:${mm}:00`,
          notes: null,
        } as Earning)
      }
    }

    // fim de semana costuma faturar mais
    if (dow === 5 || dow === 6) {
      // pequeno bônus
      earnings.push({
        id: uid(),
        user_id: 'demo',
        date: iso,
        platform: 'uber',
        amount: Number(rnd(25, 60).toFixed(2)),
        earned_time: '22:30:00',
        notes: 'pico noturno',
      } as Earning)
    }

    void dayUber
    void day99

    // combustível a cada poucos dias
    if (Math.random() < 0.4) {
      expenses.push({
        id: uid(),
        user_id: 'demo',
        date: iso,
        category: 'combustivel',
        amount: Number(rnd(70, 130).toFixed(2)),
        notes: null,
      } as Expense)
    }
    // gastos avulsos
    if (Math.random() < 0.5) {
      const cat = pick<ExpenseCategory>([
        'alimentacao',
        'pedagio',
        'lavagem',
        'estacionamento',
        'outros',
      ])
      expenses.push({
        id: uid(),
        user_id: 'demo',
        date: iso,
        category: cat,
        amount: Number(rnd(8, 40).toFixed(2)),
        notes: null,
      } as Expense)
    }
    if (Math.random() < 0.08) {
      expenses.push({
        id: uid(),
        user_id: 'demo',
        date: iso,
        category: 'manutencao',
        amount: Number(rnd(120, 350).toFixed(2)),
        notes: 'revisão',
      } as Expense)
    }
  }

  return { journeys, earnings, expenses }
}

export function loadDemo(): Store {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as Store
  } catch {
    /* ignore */
  }
  const data = seed()
  saveDemo(data)
  return data
}

export function saveDemo(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store))
  } catch {
    /* ignore */
  }
}

export function resetDemo(): Store {
  const data = seed()
  saveDemo(data)
  return data
}

export { uid as demoUid }
