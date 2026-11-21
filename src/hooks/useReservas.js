import { useCallback, useEffect, useState } from 'react'
import { listarReservas } from '../lib/datos'

/**
 * Carga reservas aplicando filtros.
 * Cada filtro es una dependencia explícita, de modo que cualquier cambio
 * dispara una nueva consulta a la base de datos.
 */
export function useReservas({
  texto = '',
  cabanaId = '',
  estado = '',
  estados = [],
  procedencia = '',
  desde = '',
  hasta = '',
  ordenAsc = false,
  limite = 0
} = {}) {
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Clave estable: evita reconsultas cuando el array de estados se
  // reconstruye en cada render con el mismo contenido.
  const estadosClave = (estados ?? []).join(',')

  const recargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const datos = await listarReservas({
        texto,
        cabanaId,
        estado,
        estados: estadosClave ? estadosClave.split(',') : [],
        procedencia,
        desde,
        hasta,
        ordenAsc,
        limite
      })
      setReservas(datos)
    } catch (e) {
      setError(e.message ?? 'No se pudieron cargar las reservas.')
      setReservas([])
    } finally {
      setCargando(false)
    }
  }, [
    texto,
    cabanaId,
    estado,
    estadosClave,
    procedencia,
    desde,
    hasta,
    ordenAsc,
    limite
  ])

  useEffect(() => {
    recargar()
  }, [recargar])

  return { reservas, cargando, error, recargar }
}
