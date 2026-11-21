import { Loader2 } from 'lucide-react'

const VARIANTES = {
  primary:
    'bg-primary-700 text-white hover:bg-primary-800 disabled:hover:bg-primary-700',
  secondary:
    'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:hover:bg-red-600',
  outline:
    'bg-white text-slate-700 border border-[var(--color-line)] hover:bg-slate-50'
}

const TAMANOS = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2'
}

/**
 * Botón reutilizable con variantes institucionales.
 * Admite estado de carga y un icono opcional a la izquierda.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  cargando = false,
  disabled = false,
  icono: Icono = null,
  className = '',
  ...resto
}) {
  const clases = [
    'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTES[variant] ?? VARIANTES.primary,
    TAMANOS[size] ?? TAMANOS.md,
    className
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={clases}
      {...resto}
    >
      {cargando ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        Icono && <Icono className="h-4 w-4" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
