/**
 * Tarjeta de indicador del panel inicial.
 */
export default function StatCard({ etiqueta, valor, icono: Icono, ayuda }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{etiqueta}</p>
        {Icono && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
            <Icono className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className="mt-3 text-3xl font-semibold leading-none text-slate-800">
        {valor}
      </p>
      {ayuda && <p className="mt-2 text-xs text-slate-400">{ayuda}</p>}
    </div>
  )
}
