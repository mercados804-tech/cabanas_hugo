import { Ban, Pencil } from 'lucide-react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import EstadoBadge from './EstadoBadge'
import { calcularNoches, formatearFecha } from '../../utils/dates'
import { PROCEDENCIAS } from '../../utils/constants'

/** Busca la etiqueta de una procedencia. */
function etiquetaProcedencia(valor) {
  return PROCEDENCIAS.find((p) => p.valor === valor)?.etiqueta ?? '—'
}

/** Fila de dato dentro del detalle. */
function Dato({ etiqueta, children }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {etiqueta}
      </dt>
      <dd className="mt-0.5 text-sm text-slate-700">{children ?? '—'}</dd>
    </div>
  )
}

/** Ventana con el detalle completo de una reserva. */
export default function ReservaDetalleModal({
  abierto,
  reserva,
  onEditar,
  onCancelar,
  onCerrar
}) {
  if (!reserva) return null

  const cancelable =
    reserva.estado === 'pendiente' || reserva.estado === 'confirmada'

  return (
    <Modal
      abierto={abierto}
      titulo="Detalle de la reserva"
      ancho="md"
      onCerrar={onCerrar}
      pie={
        <>
          <Button variant="outline" onClick={onCerrar}>
            Cerrar
          </Button>
          {cancelable && (
            <Button
              variant="danger"
              icono={Ban}
              onClick={() => onCancelar(reserva)}
            >
              Cancelar reserva
            </Button>
          )}
          <Button icono={Pencil} onClick={() => onEditar(reserva)}>
            Editar
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-800">
            {reserva.nombre_huesped}
          </h3>
          <EstadoBadge estado={reserva.estado} />
        </div>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          <Dato etiqueta="Cabaña">{reserva.cabanas?.nombre}</Dato>
          <Dato etiqueta="Procedencia">
            {etiquetaProcedencia(reserva.procedencia)}
          </Dato>
          <Dato etiqueta="DNI">{reserva.dni}</Dato>
          <Dato etiqueta="Teléfono">{reserva.telefono}</Dato>
          <Dato etiqueta="Fecha de ingreso">
            {formatearFecha(reserva.fecha_ingreso)}
          </Dato>
          <Dato etiqueta="Fecha de salida">
            {formatearFecha(reserva.fecha_salida)}
          </Dato>
          <Dato etiqueta="Noches">
            {calcularNoches(reserva.fecha_ingreso, reserva.fecha_salida)}
          </Dato>
          <Dato etiqueta="Cantidad de huéspedes">
            {reserva.cantidad_huespedes}
          </Dato>
        </dl>

        {reserva.observaciones && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Observaciones
            </p>
            <p className="mt-1 whitespace-pre-wrap rounded-lg bg-surface px-3.5 py-2.5 text-sm text-slate-600">
              {reserva.observaciones}
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
