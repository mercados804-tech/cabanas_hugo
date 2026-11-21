/** Formatea una fecha ISO (YYYY-MM-DD) al formato local DD/MM/AAAA. */
export function formatearFecha(iso) {
  if (!iso) return '—'
  const [anio, mes, dia] = String(iso).slice(0, 10).split('-')
  if (!anio || !mes || !dia) return '—'
  return `${dia}/${mes}/${anio}`
}

/** Fecha de hoy en formato ISO local (YYYY-MM-DD). */
export function hoyISO() {
  const ahora = new Date()
  const offset = ahora.getTimezoneOffset()
  return new Date(ahora.getTime() - offset * 60 * 1000)
    .toISOString()
    .slice(0, 10)
}

/**
 * Calcula la cantidad de noches entre dos fechas.
 * La fecha de salida es exclusiva: 10/12 -> 15/12 son 5 noches.
 */
export function calcularNoches(ingreso, salida) {
  if (!ingreso || !salida) return 0
  const inicio = new Date(`${ingreso}T00:00:00`)
  const fin = new Date(`${salida}T00:00:00`)
  const diferencia = (fin - inicio) / (1000 * 60 * 60 * 24)
  return Number.isFinite(diferencia) && diferencia > 0 ? Math.round(diferencia) : 0
}

/** Convierte un objeto Date a formato ISO local (YYYY-MM-DD). */
export function aISO(fecha) {
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

/** Devuelve el primer y el último día del mes al que pertenece una fecha ISO. */
export function rangoDelMes(iso) {
  const [anio, mes] = iso.split('-').map(Number)
  return {
    inicio: `${iso.slice(0, 7)}-01`,
    fin: aISO(new Date(anio, mes, 0))
  }
}

/** Lista todos los días (ISO) del mes al que pertenece una fecha ISO. */
export function diasDelMes(iso) {
  const { inicio, fin } = rangoDelMes(iso)
  const dias = []
  const cursor = new Date(`${inicio}T00:00:00`)
  const ultimo = new Date(`${fin}T00:00:00`)

  while (cursor <= ultimo) {
    dias.push(aISO(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return dias
}

/** Desplaza un mes una cantidad de meses (positiva o negativa). */
export function desplazarMes(iso, cantidad) {
  const [anio, mes] = iso.split('-').map(Number)
  return aISO(new Date(anio, mes - 1 + cantidad, 1))
}

/** Suma (o resta) días a una fecha ISO. */
export function sumarDias(iso, cantidad) {
  const [anio, mes, dia] = iso.split('-').map(Number)
  return aISO(new Date(anio, mes - 1, dia + cantidad))
}

/** Nombre del mes y año. Ej.: "diciembre de 2026". */
export function nombreMes(iso) {
  return new Date(`${iso.slice(0, 7)}-01T00:00:00`).toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric'
  })
}

/** Primer día del mes actual en formato ISO. */
export function primerDiaDelMesActual() {
  return `${hoyISO().slice(0, 7)}-01`
}

/** Indica si una fecha ISO cae sábado o domingo. */
export function esFinDeSemana(iso) {
  const dia = new Date(`${iso}T00:00:00`).getDay()
  return dia === 0 || dia === 6
}

/** Letra del día de la semana. Ej.: "L", "M", … */
export function letraDiaSemana(iso) {
  return new Date(`${iso}T00:00:00`)
    .toLocaleDateString('es-AR', { weekday: 'narrow' })
    .toUpperCase()
}
