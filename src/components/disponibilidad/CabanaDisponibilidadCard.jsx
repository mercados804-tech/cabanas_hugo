import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Users,
  XCircle
} from 'lucide-react'
import Button from '../ui/Button'
import { formatearFecha } from '../../utils/dates'

/** Estilo y etiqueta según el resultado de la consulta. */
const ESTADOS = {
  disponible: {
    etiqueta: 'Disponible',
    clase: 'border-primary-200 bg-primary-100 text-primary-700',
    Icono: CheckCircle2
  },
  ocupada: {
    etiqueta: 'Ocupada',
    clase: 'border-amber-200 bg-amber-50 text-amber-700',
    Icono: XCircle
  },
  capacidad_insuficiente: {
    etiqueta: 'Capacidad insuficiente',
    clase: 'border-amber-200 bg-amber-50 text-amber-700',
    Icono: Users
  },
  sin_capacidad: {
    etiqueta: 'Capacidad sin configurar',
    clase: 'border-amber-200 bg-amber-50 text-amber-700',
    Icono: AlertTriangle
  },
  inactiva: {
    etiqueta: 'Inactiva',
    clase: 'border-slate-200 bg-slate-100 text-slate-500',
    Icono: Ban
  }
}

/** Tarjeta con el resultado de disponibilidad de una cabaña. */
export default function CabanaDisponibilidadCard({
  cabana,
  estado,
  reserva,
  cantidad,
  onReservar
}) {
  const config = ESTADOS[estado] ?? ESTADOS.disponible
  const { Icono } = config
  const sinCapacidad = cabana.capacidad === null || cabana.capacidad === undefined

  return (
    <article
      className={`card flex flex-col p-5 ${
        estado === 'disponible' ? 'border-primary-200' : ''
      }`}
    >
      <header className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-800">
          {cabana.nombre}
        </h3>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.clase}`}
        >
          <Icono className="h-3.5 w-3.5" aria-hidden="true" />
          {config.etiqueta}
        </span>
      </header>

      <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
        <Users className="h-4 w-4 text-slate-400" aria-hidden="true" />
        {sinCapacidad ? (
          <span className="text-amber-700">Capacidad sin configurar</span>
        ) : (
          <span>
            Hasta <strong>{cabana.capacidad}</strong>{' '}
            {cabana.capacidad === 1 ? 'huésped' : 'huéspedes'}
          </span>
        )}
      </p>

      {estado === 'ocupada' && reserva && (
        <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-sm text-slate-600">
          Reserva de <strong>{reserva.nombre_huesped}</strong> del{' '}
          {formatearFecha(reserva.fecha_ingreso)} al{' '}
          {formatearFecha(reserva.fecha_salida)}.
        </p>
      )}

      {estado === 'capacidad_insuficiente' && (
        <p className="mt-2 text-sm text-amber-700">
          Se solicitaron {cantidad} huéspedes y la cabaña admite hasta{' '}
          {cabana.capacidad}.
        </p>
      )}

      {estado === 'disponible' && (
        <footer className="mt-4 border-t border-[var(--color-line)] pt-4">
          <Button size="sm" onClick={() => onReservar(cabana)}>
            Reservar esta cabaña
          </Button>
        </footer>
      )}
    </article>
  )
}
