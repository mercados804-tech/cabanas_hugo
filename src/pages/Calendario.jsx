import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Alerta from '../components/ui/Alerta'
import EmptyState from '../components/ui/EmptyState'
import CalendarioMensual from '../components/calendario/CalendarioMensual'
import DiaDetalleModal from '../components/calendario/DiaDetalleModal'
import { useCabanas } from '../hooks/useCabanas'
import { useReservas } from '../hooks/useReservas'
import {
  diasDelMes,
  desplazarMes,
  nombreMes,
  primerDiaDelMesActual,
  rangoDelMes,
  sumarDias
} from '../utils/dates'

/** Leyenda de colores del calendario. */
const LEYENDA = [
  { color: 'bg-primary-500', etiqueta: 'Confirmada' },
  { color: 'bg-amber-400', etiqueta: 'Pendiente' },
  { color: 'bg-slate-300', etiqueta: 'Finalizada' },
  { color: 'bg-white border border-[var(--color-line)]', etiqueta: 'Libre' }
]

export default function Calendario() {
  const { cabanas, cargando: cargandoCabanas } = useCabanas()
  const [mesISO, setMesISO] = useState(primerDiaDelMesActual)
  const [seleccion, setSeleccion] = useState(null)
  const navigate = useNavigate()

  const rango = rangoDelMes(mesISO)
  const dias = diasDelMes(mesISO)

  const { reservas, cargando, error, recargar } = useReservas({
    desde: rango.inicio,
    hasta: rango.fin,
    ordenAsc: true
  })

  function irANuevaReserva(cabana, dia) {
    navigate(
      `/reservas?cabana=${cabana.id}&ingreso=${dia}&salida=${sumarDias(dia, 1)}`
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Calendario"
        descripcion="Vista visual de la ocupación de las cuatro cabañas."
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

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-line)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icono={ChevronLeft}
              aria-label="Mes anterior"
              onClick={() => setMesISO(desplazarMes(mesISO, -1))}
            />
            <p className="min-w-[11rem] text-center text-sm font-semibold capitalize text-slate-800">
              {nombreMes(mesISO)}
            </p>
            <Button
              variant="outline"
              size="sm"
              icono={ChevronRight}
              aria-label="Mes siguiente"
              onClick={() => setMesISO(desplazarMes(mesISO, 1))}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMesISO(primerDiaDelMesActual())}
          >
            Mes actual
          </Button>
        </div>

        {cargandoCabanas && cabanas.length === 0 ? (
          <div className="p-5">
            <div className="h-48 animate-pulse rounded-lg bg-surface" />
          </div>
        ) : cabanas.length === 0 ? (
          <EmptyState
            icono={CalendarDays}
            titulo="No hay cabañas para mostrar"
            mensaje="Configurá las cabañas en la sección Cabañas para ver el calendario de ocupación."
          />
        ) : (
          <CalendarioMensual
            dias={dias}
            cabanas={cabanas}
            reservas={reservas}
            onSeleccionar={(cabana, dia, reserva) =>
              setSeleccion({ cabana, dia, reserva })
            }
          />
        )}

        <div className="flex flex-wrap items-center gap-4 border-t border-[var(--color-line)] px-5 py-3">
          {LEYENDA.map(({ color, etiqueta }) => (
            <span
              key={etiqueta}
              className="flex items-center gap-2 text-xs text-slate-600"
            >
              <span className={`h-3 w-3 rounded-sm ${color}`} aria-hidden="true" />
              {etiqueta}
            </span>
          ))}
          <span className="ml-auto text-xs text-slate-400">
            Hacé clic en un día para ver el detalle.
          </span>
        </div>
      </div>

      <DiaDetalleModal
        abierto={Boolean(seleccion)}
        cabana={seleccion?.cabana}
        dia={seleccion?.dia}
        reserva={seleccion?.reserva}
        onNueva={(cabana, dia) => {
          setSeleccion(null)
          irANuevaReserva(cabana, dia)
        }}
        onVerReserva={(reserva) => {
          setSeleccion(null)
          navigate(`/reservas?cabana=${reserva.cabana_id}`)
        }}
        onCerrar={() => setSeleccion(null)}
      />
    </div>
  )
}
