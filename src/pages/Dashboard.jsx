import { Link } from 'react-router-dom'
import {
  CalendarCheck,
  CalendarMinus,
  CalendarPlus,
  ClipboardList,
  DoorClosed,
  DoorOpen,
  Home,
  RefreshCw
} from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import StatCard from '../components/dashboard/StatCard'
import Card from '../components/ui/Card'
import EmptyState from '../components/ui/EmptyState'
import Alerta from '../components/ui/Alerta'
import Button from '../components/ui/Button'
import EstadoBadge from '../components/reservas/EstadoBadge'
import { useResumenPanel } from '../hooks/useResumenPanel'
import { calcularNoches, formatearFecha } from '../utils/dates'

/** Definición de los indicadores del panel. */
const INDICADORES = [
  { clave: 'totalCabanas', etiqueta: 'Total de cabañas', icono: Home },
  { clave: 'ocupadasHoy', etiqueta: 'Cabañas ocupadas hoy', icono: DoorClosed },
  {
    clave: 'disponiblesHoy',
    etiqueta: 'Cabañas disponibles hoy',
    icono: DoorOpen
  },
  {
    clave: 'confirmadasMes',
    etiqueta: 'Reservas confirmadas del mes',
    icono: CalendarCheck
  },
  { clave: 'proximosIngresos', etiqueta: 'Próximos ingresos', icono: CalendarPlus },
  { clave: 'proximasSalidas', etiqueta: 'Próximas salidas', icono: CalendarMinus }
]

export default function Dashboard() {
  const { resumen, cargando, error, recargar } = useResumenPanel()

  function valor(clave) {
    if (cargando || !resumen) return '—'
    return resumen[clave] ?? 0
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Inicio"
        descripcion="Resumen general de las cuatro cabañas y de las reservas registradas."
        acciones={
          <Button
            variant="outline"
            size="sm"
            icono={RefreshCw}
            onClick={recargar}
            cargando={cargando}
          >
            Actualizar
          </Button>
        }
      />

      {error && <Alerta tipo="error">{error}</Alerta>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {INDICADORES.map(({ clave, etiqueta, icono }) => (
          <StatCard
            key={clave}
            etiqueta={etiqueta}
            valor={valor(clave)}
            icono={icono}
            ayuda={
              clave === 'totalCabanas' && resumen
                ? `${resumen.cabanasActivas} activas`
                : undefined
            }
          />
        ))}
      </div>

      <Card
        titulo="Próximas reservas"
        descripcion="Habitantes con ingreso pendiente o en curso, ordenadas por fecha de ingreso."
        acciones={
          <Link
            to="/reservas"
            className="text-sm font-medium text-primary-700 hover:text-primary-800"
          >
            Ver todas
          </Link>
        }
      >
        {cargando && !resumen ? (
          <div className="space-y-3">
            {[1, 2, 3].map((numero) => (
              <div key={numero} className="h-12 animate-pulse rounded-lg bg-surface" />
            ))}
          </div>
        ) : resumen && resumen.proximasReservas.length > 0 ? (
          <ul className="divide-y divide-[var(--color-line)]">
            {resumen.proximasReservas.map((reserva) => (
              <li
                key={reserva.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-800">
                    {reserva.nombre_huesped}
                  </p>
                  <p className="text-sm text-slate-500">
                    {reserva.cabanas?.nombre ?? '—'} ·{' '}
                    {formatearFecha(reserva.fecha_ingreso)} al{' '}
                    {formatearFecha(reserva.fecha_salida)} ·{' '}
                    {calcularNoches(
                      reserva.fecha_ingreso,
                      reserva.fecha_salida
                    )}{' '}
                    noches · {reserva.cantidad_huespedes}{' '}
                    {reserva.cantidad_huespedes === 1 ? 'huésped' : 'huéspedes'}
                  </p>
                </div>
                <EstadoBadge estado={reserva.estado} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icono={ClipboardList}
            titulo="No hay próximas reservas"
            mensaje="Cuando se registren reservas con fecha de salida futura aparecerán en este listado."
          />
        )}
      </Card>
    </div>
  )
}
