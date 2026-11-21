import { useEffect } from 'react'
import { X } from 'lucide-react'

const ANCHOS = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-3xl'
}

/**
 * Ventana modal adaptable: en móvil ocupa el ancho completo y en
 * escritorio se centra con un ancho máximo.
 */
export default function Modal({
  abierto,
  titulo,
  descripcion,
  ancho = 'md',
  onCerrar,
  children,
  pie
}) {
  useEffect(() => {
    if (!abierto) return undefined

    function alPresionarTecla(evento) {
      if (evento.key === 'Escape') onCerrar?.()
    }

    document.addEventListener('keydown', alPresionarTecla)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', alPresionarTecla)
      document.body.style.overflow = ''
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onCerrar}
        className="absolute inset-0 bg-slate-900/50"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className={`animate-fade-in relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-panel sm:rounded-2xl ${ANCHOS[ancho] ?? ANCHOS.md}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-800">{titulo}</h2>
            {descripcion && (
              <p className="mt-0.5 text-sm text-slate-500">{descripcion}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {pie && (
          <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-line)] px-5 py-4">
            {pie}
          </footer>
        )}
      </div>
    </div>
  )
}
