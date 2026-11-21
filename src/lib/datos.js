import { supabase } from './supabase'
import { hoyISO, rangoDelMes } from '../utils/dates'

/**
 * Capa única de acceso a datos.
 * Todas las consultas a Supabase pasan por aquí para mantener los
 * componentes libres de lógica de base de datos y con errores traducidos.
 */

/** Campos de una reserva junto con el nombre de su cabaña. */
const SELECT_RESERVA = '*, cabanas ( id, nombre )'

/** Traduce los errores de PostgreSQL / Supabase a mensajes en español. */
export function traducirError(error, nombreCabana) {
  if (!error) return 'Ocurrió un error inesperado. Intentá nuevamente.'

  const cabana = nombreCabana ? `La ${nombreCabana}` : 'La cabaña seleccionada'

  switch (error.code) {
    case '23P01':
      return `No es posible guardar esta reserva. ${cabana} ya tiene otra reserva en las fechas seleccionadas.`
    case '23514':
      // Mensajes lanzados por los disparadores de validación (capacidad,
      // cabaña inactiva, fechas, etc.).
      return error.message
    case '23505':
      return 'Ya existe un registro con esos mismos datos.'
    case '23503':
      return 'El registro está relacionado con otros datos y no puede modificarse.'
    case '42501':
      return 'No tenés autorización para realizar esta operación.'
    case '42P01':
      return 'La base de datos todavía no está configurada. Ejecutá las migraciones de la Etapa 2.'
    case 'PGRST301':
      return 'Tu sesión expiró. Volvé a iniciar sesión.'
    default:
      return error.message || 'No se pudo completar la operación.'
  }
}

/* ==========================================================================
   CABAÑAS
   ========================================================================== */

/** Devuelve las cabañas ordenadas por nombre. */
export async function listarCabanas() {
  const { data, error } = await supabase
    .from('cabanas')
    .select('id, nombre, capacidad, descripcion, activa, created_at')
    .order('nombre', { ascending: true })

  if (error) throw new Error(traducirError(error))
  return data ?? []
}

/** Actualiza los datos configurables de una cabaña. */
export async function actualizarCabana(id, cambios) {
  const { data, error } = await supabase
    .from('cabanas')
    .update(cambios)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(traducirError(error))
  return data
}

/* ==========================================================================
   RESERVAS
   ========================================================================== */

/**
 * Lista reservas aplicando filtros opcionales.
 * @param {object} filtros
 * @param {string} [filtros.texto]       Busca en nombre del huésped o DNI.
 * @param {string} [filtros.cabanaId]    Filtra por cabaña.
 * @param {string} [filtros.estado]      Filtra por un estado puntual.
 * @param {string[]} [filtros.estados]   Filtra por varios estados (si no se usó `estado`).
 * @param {string} [filtros.procedencia] Filtra por procedencia del huésped.
 * @param {string} [filtros.desde]       Reservas ocupadas a partir de esta fecha.
 * @param {string} [filtros.hasta]       Reservas ocupadas hasta esta fecha.
 * @param {boolean} [filtros.ordenAsc]   Orden por fecha de ingreso.
 * @param {number} [filtros.limite]      Cantidad máxima de resultados.
 */
export async function listarReservas(filtros = {}) {
  const {
    texto,
    cabanaId,
    estado,
    estados,
    procedencia,
    desde,
    hasta,
    ordenAsc = false,
    limite
  } = filtros

  let consulta = supabase.from('reservas').select(SELECT_RESERVA)

  if (cabanaId) consulta = consulta.eq('cabana_id', cabanaId)
  if (estado) {
    consulta = consulta.eq('estado', estado)
  } else if (estados && estados.length > 0) {
    consulta = consulta.in('estado', estados)
  }
  if (procedencia) consulta = consulta.eq('procedencia', procedencia)
  if (desde) consulta = consulta.gte('fecha_salida', desde)
  if (hasta) consulta = consulta.lte('fecha_ingreso', hasta)

  // Se quitan los caracteres reservados por el filtro "or" de PostgREST.
  const limpio = String(texto ?? '')
    .trim()
    .replace(/[%,()*\\]/g, '')

  if (limpio) {
    consulta = consulta.or(
      `nombre_huesped.ilike.%${limpio}%,dni.ilike.%${limpio}%`
    )
  }

  consulta = consulta.order('fecha_ingreso', { ascending: Boolean(ordenAsc) })
  if (limite) consulta = consulta.limit(limite)

  const { data, error } = await consulta
  if (error) throw new Error(traducirError(error))
  return data ?? []
}

/** Reservas no canceladas de una cabaña que se solapan con un rango de fechas. */
export async function buscarConflictos(
  cabanaId,
  ingreso,
  salida,
  excluirReservaId = null
) {
  if (!cabanaId || !ingreso || !salida) return []

  let consulta = supabase
    .from('reservas')
    .select(
      'id, nombre_huesped, dni, fecha_ingreso, fecha_salida, estado, cantidad_huespedes'
    )
    .eq('cabana_id', cabanaId)
    .neq('estado', 'cancelada')
    .lt('fecha_ingreso', salida)
    .gt('fecha_salida', ingreso)

  if (excluirReservaId) consulta = consulta.neq('id', excluirReservaId)

  const { data, error } = await consulta
  if (error) throw new Error(traducirError(error))
  return data ?? []
}

/** Crea una reserva. `nombreCabana` se usa solo para el mensaje de error. */
export async function crearReserva(datos, nombreCabana) {
  const { data, error } = await supabase
    .from('reservas')
    .insert(datos)
    .select(SELECT_RESERVA)
    .single()

  if (error) throw new Error(traducirError(error, nombreCabana))
  return data
}

/** Actualiza una reserva existente. */
export async function actualizarReserva(id, datos, nombreCabana) {
  const { data, error } = await supabase
    .from('reservas')
    .update(datos)
    .eq('id', id)
    .select(SELECT_RESERVA)
    .single()

  if (error) throw new Error(traducirError(error, nombreCabana))
  return data
}

/** Cancela una reserva conservando el registro para el historial. */
export async function cancelarReserva(id) {
  const { data, error } = await supabase
    .from('reservas')
    .update({ estado: 'cancelada' })
    .eq('id', id)
    .select(SELECT_RESERVA)
    .single()

  if (error) throw new Error(traducirError(error))
  return data
}

/* ==========================================================================
   PANEL DE INICIO
   ========================================================================== */

/** Reúne todos los indicadores del panel principal en una sola operación. */
export async function obtenerResumenPanel() {
  const hoy = hoyISO()
  const { inicio: inicioMes, fin: finMes } = rangoDelMes(hoy)

  const [resCabanas, resOcupadas, resConfirmadas, resIngresos, resSalidas, resProximas] =
    await Promise.all([
      supabase.from('cabanas').select('id, activa'),
      supabase
        .from('reservas')
        .select('id', { count: 'exact', head: true })
        .neq('estado', 'cancelada')
        .lte('fecha_ingreso', hoy)
        .gt('fecha_salida', hoy),
      supabase
        .from('reservas')
        .select('id', { count: 'exact', head: true })
        .eq('estado', 'confirmada')
        .gte('fecha_ingreso', inicioMes)
        .lte('fecha_ingreso', finMes),
      supabase
        .from('reservas')
        .select('id', { count: 'exact', head: true })
        .in('estado', ['pendiente', 'confirmada'])
        .gt('fecha_ingreso', hoy),
      supabase
        .from('reservas')
        .select('id', { count: 'exact', head: true })
        .in('estado', ['pendiente', 'confirmada'])
        .gte('fecha_salida', hoy),
      supabase
        .from('reservas')
        .select(SELECT_RESERVA)
        .in('estado', ['pendiente', 'confirmada'])
        .gte('fecha_salida', hoy)
        .order('fecha_ingreso', { ascending: true })
        .limit(8)
    ])

  const conError = [
    resCabanas,
    resOcupadas,
    resConfirmadas,
    resIngresos,
    resSalidas,
    resProximas
  ].find((resultado) => resultado.error)

  if (conError) throw new Error(traducirError(conError.error))

  const cabanas = resCabanas.data ?? []
  const activas = cabanas.filter((cabana) => cabana.activa).length
  const ocupadasHoy = resOcupadas.count ?? 0

  return {
    totalCabanas: cabanas.length,
    cabanasActivas: activas,
    ocupadasHoy,
    disponiblesHoy: Math.max(0, activas - ocupadasHoy),
    confirmadasMes: resConfirmadas.count ?? 0,
    proximosIngresos: resIngresos.count ?? 0,
    proximasSalidas: resSalidas.count ?? 0,
    proximasReservas: resProximas.data ?? []
  }
}
