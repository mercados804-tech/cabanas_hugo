import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle, LogIn, ShieldCheck } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../context/AuthContext'
import { MENSAJE_CONFIGURACION } from '../lib/supabase'
import { IconoMarca } from '../utils/constants'

/** Validación del formulario de acceso. */
const esquema = z.object({
  identificador: z
    .string()
    .trim()
    .min(1, 'Ingresá tu usuario o correo electrónico.'),
  password: z.string().min(1, 'Ingresá tu contraseña.')
})

export default function Login() {
  const { session, loading, signIn, configured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorGeneral, setErrorGeneral] = useState('')

  const destino = location.state?.desde ?? '/'

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: { identificador: '', password: '' }
  })

  // Si ya hay sesión activa, no se muestra el formulario.
  if (!loading && session) {
    return <Navigate to={destino} replace />
  }

  async function enviar(datos) {
    setErrorGeneral('')
    try {
      await signIn(datos.identificador, datos.password)
      navigate(destino, { replace: true })
    } catch (error) {
      setErrorGeneral(error.message ?? 'No se pudo iniciar sesión.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-surface)] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Marca institucional */}
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700 text-white shadow-panel">
            <IconoMarca className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-semibold text-slate-800">
            Gestión de Reservas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Cabañas Puerto Iguazú · Ejército Argentino
          </p>
        </div>

        {/* Tarjeta de acceso */}
        <div className="card p-6 sm:p-7">
          <h2 className="text-lg font-semibold text-slate-800">
            Iniciar sesión
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Acceso exclusivo del administrador.
          </p>

          {!configured && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{MENSAJE_CONFIGURACION}</span>
            </div>
          )}

          <form
            onSubmit={handleSubmit(enviar)}
            className="mt-5 space-y-4"
            noValidate
          >
            <Input
              label="Usuario o correo electrónico"
              autoComplete="username"
              placeholder="administrador@cabanasiguazu.mil.ar"
              error={errors.identificador?.message}
              {...register('identificador')}
            />

            <Input
              label="Contraseña"
              esPassword
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {errorGeneral && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorGeneral}</span>
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              icono={LogIn}
              cargando={isSubmitting}
              disabled={!configured}
              className="w-full"
            >
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </Button>
          </form>
        </div>

        {/* Nota de seguridad */}
        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Sistema privado. No permite registro de usuarios.
        </p>
      </div>
    </div>
  )
}
