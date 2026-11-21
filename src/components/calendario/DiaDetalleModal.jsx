import { CalendarPlus, Pencil } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Alerta from '../ui/Alerta'
import EstadoBadge from '../reservas/EstadoBadge'
import { calcularNoches, formatearFecha } from '../../utils/dates'

/** Ventana con el detalle de un día de una cabaña. */
export default function DiaDetalleModal({
  abierto,
  cabana,
  dia,
  reserva,
  onNueva,
  onVerReserva,
  onCerrar
}) {
  if (!cabana || !dia) return null

  return (
    <Modal
      abierto={abierto}
      titulo={cabana.nombre}
      descripcion={formatearFecha(dia)}
      ancho="sm"
      onCerrar={onCerrar}
      pie={
        <>
          <Button variant="outline" onClick={onCerrar}>
            Cerrar
          </Button>
          {reserva ? (
            <Button icono={Pencil} onClick={() => onVerReserva(reserva)}>
              Ver reserva
            </Button>
          ) : (
            <Button icono={CalendarPlus} onClick={() => onNueva(cabana, dia)}>
              Nueva reserva
            </Button>
          )}
        </>
      }
    >
      {reserva ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-slate-800">
              {reserva.nombre_huesped}
            </p>
            <EstadoBadge estado={reserva.estado} />
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-slate-500">Ingreso</dt>
              <dd className="text-slate-700">
                {formatearFecha(reserva.fecha_ingreso)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Salida</dt>
              <dd className="text-slate-700">
                {formatearFecha(reserva.fecha_salida)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Noches</dt>
              <dd className="text-slate-700">
                {calcularNoches(reserva.fecha_ingreso, reserva.fecha_salida)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Huéspedes</dt>
              <dd className="text-slate-700">{reserva.cantidad_huespedes}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <Alerta tipo="info">
          Esta cabaña está libre el {formatearFecha(dia)}. Podés registrar una
          reserva que comience en esta fecha.
        </Alerta>
      )}
    </Modal>
  )
}
