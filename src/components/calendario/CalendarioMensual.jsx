import { hoyISO, esFinDeSemana, letraDiaSemana } from '../../utils/dates'

/** Color de relleno según el estado de la reserva. */
const RELLENO = {
  pendiente: 'bg-amber-400',
  confirmada: 'bg-primary-500',
  finalizada: 'bg-slate-300'
}

/**
 * Construye un índice rápido "cabaña|día" -> reserva para los días indicados.
 * Una reserva ocupa desde fecha_ingreso (inclusive) hasta fecha_salida
 * (exclusiva), por lo que un ingreso puede coincidir con una salida.
 */
function construirOcupacion(reservas, dias) {
  const mapa = new Map()

  for (const reserva of reservas) {
    if (reserva.estado === 'cancelada') continue

    for (const dia of dias) {
      if (dia >= reserva.fecha_ingreso && dia < reserva.fecha_salida) {
        mapa.set(`${reserva.cabana_id}|${dia}`, reserva)
      }
    }
  }

  return mapa
}

/** Grilla mensual de ocupación: una fila por cabaña y una columna por día. */
export default function CalendarioMensual({
  dias,
  cabanas,
  reservas,
  onSeleccionar
}) {
  const ocupacion = construirOcupacion(reservas, dias)
  const hoy = hoyISO()

  return (
    <div className="scroll-thin overflow-x-auto">
      <table className="border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-20 border-b border-r border-[var(--color-line)] bg-white px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              Cabaña
            </th>
            {dias.map((dia) => (
              <th
                key={dia}
                className={`border-b border-r border-[var(--color-line)] px-0 py-1 text-center ${
                  esFinDeSemana(dia) ? 'bg-surface' : 'bg-white'
                }`}
              >
                <span
                  className={`block text-[10px] font-normal text-slate-400 ${
                    dia === hoy ? 'text-primary-600' : ''
                  }`}
                >
                  {letraDiaSemana(dia)}
                </span>
                <span
                  className={`block text-xs ${
                    dia === hoy
                      ? 'font-bold text-primary-700'
                      : 'font-medium text-slate-600'
                  }`}
                >
                  {Number(dia.slice(8, 10))}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cabanas.map((cabana) => (
            <tr key={cabana.id}>
              <th className="sticky left-0 z-10 border-b border-r border-[var(--color-line)] bg-white px-4 py-1 text-left text-sm font-medium text-slate-700">
                {cabana.nombre}
              </th>
              {dias.map((dia) => {
                const reserva = ocupacion.get(`${cabana.id}|${dia}`)
                const finde = esFinDeSemana(dia)

                return (
                  <td
                    key={dia}
                    className={`border-b border-r border-[var(--color-line)] p-0 ${
                      reserva ? '' : finde ? 'bg-surface' : 'bg-white'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSeleccionar(cabana, dia, reserva ?? null)}
                      title={
                        reserva
                          ? `${reserva.nombre_huesped} · ${reserva.estado}`
                          : `${cabana.nombre} libre el ${dia}`
                      }
                      aria-label={
                        reserva
                          ? `${cabana.nombre}, ocupada el ${dia} por ${reserva.nombre_huesped}`
                          : `${cabana.nombre}, libre el ${dia}`
                      }
                      className={`h-9 w-full min-w-[2.25rem] transition-colors ${
                        reserva
                          ? `${RELLENO[reserva.estado] ?? 'bg-slate-300'} hover:opacity-80`
                          : 'hover:bg-primary-100'
                      } ${dia === hoy ? 'ring-1 ring-inset ring-primary-400' : ''}`}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
