import { CalendarDays, Settings, Users } from 'lucide-react'
import Button from '../ui/Button'

/** Tarjeta de una cabaña con su capacidad y estado. */
export default function CabanaCard({ cabana, onConfigurar, onVerReservas }) {
  const sinCapacidad = cabana.capacidad === null || cabana.capacidad === undefined

  return (
    <article className="card flex flex-col p-5">
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-800">
          {cabana.nombre}
        </h3>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            cabana.activa
              ? 'border-primary-200 bg-primary-100 text-primary-700'
              : 'border-slate-200 bg-slate-100 text-slate-500'
          }`}
        >
          {cabana.activa ? 'Activa' : 'Inactiva'}
        </span>
      </header>

      <div className="mt-3 space-y-2">
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {sinCapacidad ? (
            <span className="font-medium text-amber-700">
              Capacidad sin configurar
            </span>
          ) : (
            <span>
              Hasta <strong>{cabana.capacidad}</strong>{' '}
              {cabana.capacidad === 1 ? 'huésped' : 'huéspedes'}
            </span>
          )}
        </p>

        {cabana.descripcion && (
          <p className="text-sm text-slate-500">{cabana.descripcion}</p>
        )}
      </div>

      <footer className="mt-4 flex flex-wrap gap-2 border-t border-[var(--color-line)] pt-4">
        <Button
          variant="secondary"
          size="sm"
          icono={Settings}
          onClick={() => onConfigurar(cabana)}
        >
          Configurar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icono={CalendarDays}
          onClick={() => onVerReservas(cabana)}
        >
          Ver reservas
        </Button>
      </footer>
    </article>
  )
}
