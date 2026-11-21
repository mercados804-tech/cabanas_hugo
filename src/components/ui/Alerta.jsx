import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X
} from 'lucide-react'

const TIPOS = {
  info: {
    clase: 'border-primary-200 bg-primary-50 text-primary-800',
    Icono: Info
  },
  exito: {
    clase: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    Icono: CheckCircle2
  },
  advertencia: {
    clase: 'border-amber-200 bg-amber-50 text-amber-800',
    Icono: AlertTriangle
  },
  error: {
    clase: 'border-red-200 bg-red-50 text-red-700',
    Icono: AlertCircle
  }
}

/** Aviso con estilo según su tipo (info, exito, advertencia, error). */
export default function Alerta({
  tipo = 'info',
  titulo,
  children,
  onCerrar,
  className = ''
}) {
  const config = TIPOS[tipo] ?? TIPOS.info
  const { Icono } = config

  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${config.clase} ${className}`}
    >
      <Icono className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {titulo && <p className="font-medium">{titulo}</p>}
        {children && <div className={titulo ? 'mt-0.5' : ''}>{children}</div>}
      </div>
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="rounded p-0.5 opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
