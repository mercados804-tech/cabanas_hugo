import { Loader2 } from 'lucide-react'

/** Indicador de carga a pantalla completa. */
export default function PantallaCargando({ mensaje = 'Cargando…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[var(--color-surface)]">
      <Loader2 className="h-7 w-7 animate-spin text-primary-700" />
      <p className="text-sm text-slate-500">{mensaje}</p>
    </div>
  )
}
