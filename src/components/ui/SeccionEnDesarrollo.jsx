import { Info } from 'lucide-react'

/**
 * Aviso para secciones que se habilitan en una etapa posterior
 * del plan de implementación.
 */
export default function SeccionEnDesarrollo({ etapa, titulo, detalle = [] }) {
  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
          Etapa {etapa}
        </span>
        <h3 className="text-base font-semibold text-slate-800">{titulo}</h3>
      </div>

      <p className="mt-3 flex items-start gap-2 text-sm text-slate-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
        <span>
          Esta sección se habilita en la <strong>Etapa {etapa}</strong> del plan
          de implementación. Todavía no está conectada a la base de datos.
        </span>
      </p>

      {detalle.length > 0 && (
        <ul className="mt-4 space-y-2">
          {detalle.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 text-sm text-slate-600"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
