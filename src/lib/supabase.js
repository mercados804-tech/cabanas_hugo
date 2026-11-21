import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase.
 *
 * Solo se utilizan variables públicas (VITE_*), por lo que la clave
 * expuesta es la "anon". El acceso real a los datos se controla
 * mediante las políticas RLS configuradas en Supabase.
 *
 * La clave "service_role" NUNCA debe usarse en el frontend.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Indica si las variables de entorno de Supabase están completas. */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('tu-proyecto')
)

/** Cliente único de Supabase (o null si falta configuración). */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
  : null

/** Mensaje de ayuda cuando falta configurar el archivo .env */
export const MENSAJE_CONFIGURACION =
  'Falta configurar la conexión con Supabase. Copiá el archivo .env.example como .env y completá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.'
