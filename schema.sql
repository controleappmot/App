export type Platform = 'uber' | '99'

export type ExpenseCategory =
  | 'combustivel'
  | 'pedagio'
  | 'alimentacao'
  | 'lavagem'
  | 'manutencao'
  | 'estacionamento'
  | 'outros'

export interface Journey {
  id: string
  user_id: string
  start_time: string // ISO
  end_time: string | null
  start_km: number
  end_km: number | null
  total_km: number | null
  total_hours: number | null
  created_at: string
}

export interface Earning {
  id: string
  user_id: string
  date: string // yyyy-mm-dd
  platform: Platform
  amount: number
  earned_time: string | null // HH:MM:SS
  notes: string | null
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  date: string // yyyy-mm-dd
  category: ExpenseCategory
  amount: number
  notes: string | null
  created_at: string
}

export const PLATFORM_LABEL: Record<Platform, string> = {
  uber: 'Uber',
  '99': '99',
}

export const CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  combustivel: 'Combustível',
  pedagio: 'Pedágio',
  alimentacao: 'Alimentação',
  lavagem: 'Lavagem',
  manutencao: 'Manutenção',
  estacionamento: 'Estacionamento',
  outros: 'Outros',
}

export const CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  combustivel: '⛽',
  pedagio: '🛣️',
  alimentacao: '🍽️',
  lavagem: '🧼',
  manutencao: '🔧',
  estacionamento: '🅿️',
  outros: '📦',
}
