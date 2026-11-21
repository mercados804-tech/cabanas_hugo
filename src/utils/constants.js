import {
  Home,
  CalendarDays,
  ClipboardList,
  Home as HomeIcon,
  Search,
  LayoutGrid
} from 'lucide-react'

/**
 * Opciones del menú lateral.
 * `end` se usa para que "Inicio" (ruta raíz) no quede activo
 * cuando se navega a otras secciones.
 */
export const MENU_PRINCIPAL = [
  { nombre: 'Inicio', ruta: '/', icono: Home, end: true },
  { nombre: 'Calendario', ruta: '/calendario', icono: CalendarDays },
  { nombre: 'Reservas', ruta: '/reservas', icono: ClipboardList },
  { nombre: 'Cabañas', ruta: '/cabanas', icono: HomeIcon },
  { nombre: 'Disponibilidad', ruta: '/disponibilidad', icono: Search }
]

/** Icono utilizado como marca de la aplicación. */
export const IconoMarca = LayoutGrid

/**
 * Estados posibles de una reserva.
 * El valor coincide con el guardado en la base de datos.
 */
export const ESTADOS_RESERVA = [
  {
    valor: 'pendiente',
    etiqueta: 'Pendiente',
    clase: 'bg-amber-50 text-amber-700 border-amber-200',
    punto: 'bg-amber-500'
  },
  {
    valor: 'confirmada',
    etiqueta: 'Confirmada',
    clase: 'bg-primary-100 text-primary-700 border-primary-200',
    punto: 'bg-primary-600'
  },
  {
    valor: 'finalizada',
    etiqueta: 'Finalizada',
    clase: 'bg-slate-100 text-slate-600 border-slate-200',
    punto: 'bg-slate-500'
  },
  {
    valor: 'cancelada',
    etiqueta: 'Cancelada',
    clase: 'bg-slate-100 text-slate-500 border-slate-200 line-through',
    punto: 'bg-slate-400'
  }
]

/** Busca la configuración visual de un estado. */
export function obtenerEstado(valor) {
  return (
    ESTADOS_RESERVA.find((estado) => estado.valor === valor) ?? {
      valor,
      etiqueta: valor ?? 'Sin estado',
      clase: 'bg-slate-100 text-slate-600 border-slate-200',
      punto: 'bg-slate-400'
    }
  )
}

/** Procedencias admitidas para el huésped. */
export const PROCEDENCIAS = [
  { valor: 'personal_militar', etiqueta: 'Personal militar' },
  { valor: 'civil', etiqueta: 'Civil' }
]

/** Cantidad de cabañas gestionadas por el sistema. */
export const TOTAL_CABANAS = 4
