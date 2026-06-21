import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { Journey, Earning, Expense } from '../lib/types'
import { hoursBetween } from '../lib/dates'

interface DataValue {
  journeys: Journey[]
  earnings: Earning[]
  expenses: Expense[]
  loading: boolean
  error: string | null
  activeJourney: Journey | null
  refresh: () => Promise<void>
  startJourney: (startKm: number) => Promise<void>
  endJourney: (journey: Journey, endKm: number) => Promise<void>
  deleteJourney: (id: string) => Promise<void>
  addEarning: (e: Omit<Earning, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  deleteEarning: (id: string) => Promise<void>
  addExpense: (x: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
}

export const DataContext = createContext<DataValue | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [journeys, setJourneys] = useState<Journey[]>([])
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [j, e, x] = await Promise.all([
        supabase.from('journeys').select('*').order('start_time', { ascending: false }),
        supabase.from('earnings').select('*').order('date', { ascending: false }),
        supabase.from('expenses').select('*').order('date', { ascending: false }),
      ])
      if (j.error) throw j.error
      if (e.error) throw e.error
      if (x.error) throw x.error
      setJourneys((j.data ?? []) as Journey[])
      setEarnings((e.data ?? []) as Earning[])
      setExpenses((x.data ?? []) as Expense[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) refresh()
    else {
      setJourneys([])
      setEarnings([])
      setExpenses([])
      setLoading(false)
    }
  }, [user, refresh])

  const activeJourney = journeys.find((j) => j.end_time === null) ?? null

  const startJourney = async (startKm: number) => {
    if (!user) return
    const { error: e } = await supabase.from('journeys').insert({
      user_id: user.id,
      start_time: new Date().toISOString(),
      start_km: startKm,
    })
    if (e) throw e
    await refresh()
  }

  const endJourney = async (journey: Journey, endKm: number) => {
    const end = new Date().toISOString()
    const totalKm = Math.max(0, endKm - journey.start_km)
    const totalHours = hoursBetween(journey.start_time, end)
    const { error: e } = await supabase
      .from('journeys')
      .update({
        end_time: end,
        end_km: endKm,
        total_km: totalKm,
        total_hours: Number(totalHours.toFixed(2)),
      })
      .eq('id', journey.id)
    if (e) throw e
    await refresh()
  }

  const deleteJourney = async (id: string) => {
    const { error: e } = await supabase.from('journeys').delete().eq('id', id)
    if (e) throw e
    await refresh()
  }

  const addEarning: DataValue['addEarning'] = async (rec) => {
    if (!user) return
    const { error: e } = await supabase.from('earnings').insert({ ...rec, user_id: user.id })
    if (e) throw e
    await refresh()
  }

  const deleteEarning = async (id: string) => {
    const { error: e } = await supabase.from('earnings').delete().eq('id', id)
    if (e) throw e
    await refresh()
  }

  const addExpense: DataValue['addExpense'] = async (rec) => {
    if (!user) return
    const { error: e } = await supabase.from('expenses').insert({ ...rec, user_id: user.id })
    if (e) throw e
    await refresh()
  }

  const deleteExpense = async (id: string) => {
    const { error: e } = await supabase.from('expenses').delete().eq('id', id)
    if (e) throw e
    await refresh()
  }

  return (
    <DataContext.Provider
      value={{
        journeys,
        earnings,
        expenses,
        loading,
        error,
        activeJourney,
        refresh,
        startJourney,
        endJourney,
        deleteJourney,
        addEarning,
        deleteEarning,
        addExpense,
        deleteExpense,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData deve ser usado dentro de DataProvider')
  return ctx
}
