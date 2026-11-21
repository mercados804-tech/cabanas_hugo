/**
 * Estado vacío o informativo dentro de una tarjeta.
 */
export default function EmptyState({ icono: Icono, titulo, mensaje, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
      {Icono && (
        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <Icono className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      {titulo && <p className="text-sm font-medium text-slate-700">{titulo}</p>}
      {mensaje && <p className="max-w-md text-sm text-slate-500">{mensaje}</p>}
      {children && <div className="mt-2">{children}</div>}
    </div>
  )
}
