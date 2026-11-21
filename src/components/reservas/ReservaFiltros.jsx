import { X } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { ESTADOS_RESERVA } from '../../utils/constants'

/** Barra de búsqueda y filtros del listado de reservas. */
export default function ReservaFiltros({
  texto,
  onTexto,
  cabanaId,
  onCabana,
  estado,
  onEstado,
  desde,
  onDesde,
  hasta,
  onHasta,
  ordenAsc,
  onOrden,
  cabanas,
  onLimpiar
}) {
  const hayFiltros =
    Boolean(texto) ||
    Boolean(cabanaId) ||
    Boolean(estado) ||
    Boolean(desde) ||
    Boolean(hasta)

  return (
    <div className="card p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="sm:col-span-2">
          <Input
            label="Buscar huésped"
            placeholder="Nombre o DNI…"
            value={texto}
            onChange={(evento) => onTexto(evento.target.value)}
            aria-label="Buscar por nombre o DNI"
          />
        </div>

        <Select
          label="Cabaña"
          value={cabanaId}
          onChange={(evento) => onCabana(evento.target.value)}
        >
          <option value="">Todas</option>
          {cabanas.map((cabana) => (
            <option key={cabana.id} value={cabana.id}>
              {cabana.nombre}
            </option>
          ))}
        </Select>

        <Select
          label="Estado"
          value={estado}
          onChange={(evento) => onEstado(evento.target.value)}
        >
          <option value="">Todos</option>
          {ESTADOS_RESERVA.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </Select>

        <Input
          label="Ingreso desde"
          type="date"
          value={desde}
          onChange={(evento) => onDesde(evento.target.value)}
        />

        <Input
          label="Hasta"
          type="date"
          value={hasta}
          onChange={(evento) => onHasta(evento.target.value)}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary-700 focus:ring-primary-500"
            checked={ordenAsc}
            onChange={(evento) => onOrden(evento.target.checked)}
          />
          Ordenar por fecha de ingreso más antigua primero
        </label>

        {hayFiltros && (
          <Button variant="ghost" size="sm" icono={X} onClick={onLimpiar}>
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}
