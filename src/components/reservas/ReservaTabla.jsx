import { Ban, Eye, Pencil } from 'lucide-react'
import EstadoBadge from './EstadoBadge'
import Button from '../ui/Button'
import { calcularNoches, formatearFecha } from '../../utils/dates'

/** Devuelve el nombre de la cabaña asociada a una reserva. */
function nombreCabana(reserva) {
  return reserva.cabanas?.nombre ?? '—'
}

/** Indica si una reserva puede cancelarse. */
function esCancelable(reserva) {
  return reserva.estado === 'pendiente' || reserva.estado === 'confirmada'
}

/**
 * Listado de reservas: tabla en escritorio y tarjetas en móvil.
 */
export default function ReservaTabla({
  reservas,
  cargando,
  onVer,
  onEditar,
  onCancelar,
  soloLectura = false
}) {
  if (cargando && reservas.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((numero) => (
          <div key={numero} className="h-14 animate-pulse rounded-lg bg-white" />
        ))}
      </div>
    )
  }

  return (
    <>
      {/* Escritorio */}
      <div className="card hidden overflow-hidden lg:block">
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-medium">Huésped</th>
                <th className="px-5 py-3 font-medium">Cabaña</th>
                <th className="px-5 py-3 font-medium">Ingreso</th>
                <th className="px-5 py-3 font-medium">Salida</th>
                <th className="px-5 py-3 font-medium">Noches</th>
                <th className="px-5 py-3 font-medium">Huéspedes</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((reserva) => (
                <tr
                  key={reserva.id}
                  className="border-b border-[var(--color-line)] last:border-0 hover:bg-surface/60"
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">
                      {reserva.nombre_huesped}
                    </p>
                    <p className="text-xs text-slate-500">DNI {reserva.dni}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {nombreCabana(reserva)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatearFecha(reserva.fecha_ingreso)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {formatearFecha(reserva.fecha_salida)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {calcularNoches(reserva.fecha_ingreso, reserva.fecha_salida)}
                  </td>
                  <td className="px-5 py-3 text-slate-600">
                    {reserva.cantidad_huespedes}
                  </td>
                  <td className="px-5 py-3">
                    <EstadoBadge estado={reserva.estado} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icono={Eye}
                        onClick={() => onVer(reserva)}
                      >
                        Ver
                      </Button>
                      {!soloLectura && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icono={Pencil}
                          onClick={() => onEditar(reserva)}
                        >
                          Editar
                        </Button>
                      )}
                      {!soloLectura && esCancelable(reserva) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icono={Ban}
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => onCancelar(reserva)}
                        >
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Móvil */}
      <div className="space-y-3 lg:hidden">
        {reservas.map((reserva) => (
          <article key={reserva.id} className="card p-4">
            <header className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-800">
                  {reserva.nombre_huesped}
                </p>
                <p className="text-xs text-slate-500">DNI {reserva.dni}</p>
              </div>
              <EstadoBadge estado={reserva.estado} />
            </header>

            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div>
                <dt className="text-xs text-slate-500">Cabaña</dt>
                <dd className="text-slate-700">{nombreCabana(reserva)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Huéspedes</dt>
                <dd className="text-slate-700">{reserva.cantidad_huespedes}</dd>
              </div>
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
            </dl>

            <footer className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-line)] pt-3">
              <Button
                variant="ghost"
                size="sm"
                icono={Eye}
                onClick={() => onVer(reserva)}
              >
                Ver
              </Button>
              {!soloLectura && (
                <Button
                  variant="ghost"
                  size="sm"
                  icono={Pencil}
                  onClick={() => onEditar(reserva)}
                >
                  Editar
                </Button>
              )}
              {!soloLectura && esCancelable(reserva) && (
                <Button
                  variant="ghost"
                  size="sm"
                  icono={Ban}
                  className="text-red-600 hover:bg-red-50"
                  onClick={() => onCancelar(reserva)}
                >
                  Cancelar
                </Button>
              )}
            </footer>
          </article>
        ))}
      </div>
    </>
  )
}
