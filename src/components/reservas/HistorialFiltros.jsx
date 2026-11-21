import { X } from 'lucide-react'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { ESTADOS_RESERVA, PROCEDENCIAS } from '../../utils/constants'

/**
 * Filtros ampliados de la vista Historial: búsqueda por huésped,
 * cabaña, procedencia, uno o varios estados y rango de fechas.
 */
export default function HistorialFiltros({
  texto,
  onTexto,
  cabanaId,
  onCabana,
  procedencia,
  onProcedencia,
  estados,
  onAlternarEstado,
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
    Boolean(procedencia) ||
    Boolean(desde) ||
    Boolean(hasta) ||
    estados.length > 0

  return (
    <div className="card p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-1">
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
          label="Procedencia"
          value={procedencia}
          onChange={(evento) => onProcedencia(evento.target.value)}
        >
          <option value="">Todas</option>
          {PROCEDENCIAS.map((opcion) => (
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

      <fieldset className="mt-4">
        <legend className="label mb-1.5">Estados</legend>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {ESTADOS_RESERVA.map((opcion) => (
            <label
              key={opcion.valor}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary-700 focus:ring-primary-500"
                checked={estados.includes(opcion.valor)}
                onChange={() => onAlternarEstado(opcion.valor)}
              />
              <span className={`h-2 w-2 rounded-full ${opcion.punto}`} aria-hidden="true" />
              {opcion.etiqueta}
            </label>
          ))}
        </div>
      </fieldset>

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
