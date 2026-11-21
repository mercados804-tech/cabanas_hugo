import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { supabase, isSupabaseConfigured, MENSAJE_CONFIGURACION } from '../lib/supabase'

const AuthContext = createContext(null)

/**
 * Alias opcional del correo del administrador.
 * Permite ingresar con un nombre de usuario simple en lugar del correo.
 * Si no está definido, el acceso requiere el correo electrónico completo.
 */
const ADMIN_EMAIL_ALIAS = import.meta.env.VITE_ADMIN_EMAIL ?? ''

/** Traduce los errores más frecuentes de Supabase Auth al español. */
function traducirErrorAuth(mensaje = '') {
  const texto = mensaje.toLowerCase()

  if (texto.includes('invalid login credentials')) {
    return 'Usuario o contraseña incorrectos.'
  }
  if (texto.includes('email not confirmed')) {
    return 'La cuenta aún no está confirmada. Verificala en Supabase.'
  }
  if (texto.includes('too many requests') || texto.includes('rate limit')) {
    return 'Demasiados intentos. Esperá unos minutos e intentá nuevamente.'
  }
  if (texto.includes('failed to fetch') || texto.includes('network')) {
    return 'No se pudo conectar con el servidor. Revisá tu conexión a Internet.'
  }
  return mensaje || 'No se pudo iniciar sesión. Intentá nuevamente.'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return undefined
    }

    let activo = true

    // Sesión inicial recuperada del almacenamiento local.
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!activo) return
        setSession(data?.session ?? null)
        setLoading(false)
      })
      .catch(() => {
        if (!activo) return
        setSession(null)
        setLoading(false)
      })

    // Escucha cambios: ingreso, cierre de sesión y expiración de token.
    const { data: suscripcion } = supabase.auth.onAuthStateChange(
      (_evento, nuevaSesion) => {
        setSession(nuevaSesion ?? null)
      }
    )

    return () => {
      activo = false
      suscripcion?.subscription?.unsubscribe?.()
    }
  }, [])

  const signIn = useCallback(async (identificador, password) => {
    if (!isSupabaseConfigured) {
      throw new Error(MENSAJE_CONFIGURACION)
    }

    const valor = (identificador ?? '').trim()
    if (!valor) throw new Error('Ingresá tu usuario o correo electrónico.')
    if (!password) throw new Error('Ingresá tu contraseña.')

    let email = valor
    if (!valor.includes('@')) {
      if (!ADMIN_EMAIL_ALIAS) {
        throw new Error(
          'Ingresá tu correo electrónico de administrador o configurá VITE_ADMIN_EMAIL para usar un nombre de usuario.'
        )
      }
      email = ADMIN_EMAIL_ALIAS
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw new Error(traducirErrorAuth(error.message))
    return data
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(traducirErrorAuth(error.message))
  }, [])

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      configured: isSupabaseConfigured,
      signIn,
      signOut
    }),
    [session, loading, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/** Hook de acceso al contexto de autenticación. */
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider.')
  }
  return contexto
}
