import { CalendarDays, ClipboardList, Users } from 'lucide-react'
import StatCard from '../dashboard/StatCard'
import { ESTADOS_RESERVA } from '../../utils/constants'
import { calcularNoches } from '../../utils/dates'

/**
 * Totales de la vista Historial calculados sobre las reservas que
 * devolvieron los filtros activos.
 */
export default function HistorialResumen({ reservas, cargando }) {
  const validas = reservas.filter((reserva) => reserva.estado !== 'cancelada')

  const noches = validas.reduce(
    (total, reserva) =>
      total + calcularNoches(reserva.fecha_ingreso, reserva.fecha_salida),
    0
  )

  const huespedes = validas.reduce(
    (total, reserva) => total + (reserva.cantidad_huespedes ?? 0),
    0
  )

  const porEstado = ESTADOS_RESERVA.map((opcion) => ({
    ...opcion,
    cantidad: reservas.filter((reserva) => reserva.estado === opcion.valor)
      .length
  }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          etiqueta="Reservas encontradas"
          valor={cargando ? '—' : reservas.length}
          icono={ClipboardList}
        />
        <StatCard
          etiqueta="Noches acumuladas"
          valor={cargando ? '—' : noches}
          icono={CalendarDays}
          ayuda="No incluye reservas canceladas"
        />
        <StatCard
          etiqueta="Huéspedes registrados"
          valor={cargando ? '—' : huespedes}
          icono={Users}
          ayuda="No incluye reservas canceladas"
        />
      </div>

      <div className="card p-5">
        <p className="text-sm font-medium text-slate-500">
          Distribución por estado
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {porEstado.map((opcion) => (
            <div
              key={opcion.valor}
              className="flex items-center gap-2 rounded-lg border border-[var(--color-line)] px-3 py-2"
            >
              <span
                className={`h-2.5 w-2.5 rounded-full ${opcion.punto}`}
                aria-hidden="true"
              />
              <span className="text-sm text-slate-600">{opcion.etiqueta}</span>
              <span className="text-sm font-semibold text-slate-800">
                {cargando ? '—' : opcion.cantidad}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
