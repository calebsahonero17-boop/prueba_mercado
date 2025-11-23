import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Configuración optimizada para mejorar conectividad
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configuraciones de auth simplificadas para mejor persistencia
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,  // Usar localStorage explícitamente
    storageKey: 'supabase.auth.token', // Clave específica para el token
    flowType: 'pkce'
  },
  global: {
    // Headers optimizados
    headers: {
      'X-Client-Info': 'mercado-express@1.0.0',
      'apikey': supabaseAnonKey, // Añadir explícitamente la anon key como apikey
    },
  },
  // Configuraciones de fetch optimizadas
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
