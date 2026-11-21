import { obtenerEstado } from '../../utils/constants'

/**
 * Etiqueta de estado de una reserva.
 * Los colores se definen en src/utils/constants.js
 */
export default function BadgeEstado({ estado, className = '' }) {
  const config = obtenerEstado(estado)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.clase} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.punto}`} aria-hidden="true" />
      {config.etiqueta}
    </span>
  )
}
