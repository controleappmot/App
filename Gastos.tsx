import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!url || !anonKey) {
  // Mensagem clara em vez de uma tela branca quando o .env não foi configurado.
  // eslint-disable-next-line no-console
  console.error(
    'Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes. ' +
      'Configure o arquivo .env.local (local) ou as variáveis de ambiente no deploy.',
  )
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

export const isSupabaseConfigured = Boolean(url && anonKey)
