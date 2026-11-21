import { obtenerEstado } from '../../utils/constants'

/** Etiqueta visual del estado de una reserva. */
export default function EstadoBadge({ estado }) {
  const config = obtenerEstado(estado)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.clase}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${config.punto}`}
        aria-hidden="true"
      />
      {config.etiqueta}
    </span>
  )
}
