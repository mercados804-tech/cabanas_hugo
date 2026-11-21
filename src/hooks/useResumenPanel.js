import { useCallback, useEffect, useState } from 'react'
import { obtenerResumenPanel } from '../lib/datos'

/** Carga los indicadores y las próximas reservas del panel inicial. */
export function useResumenPanel() {
  const [resumen, setResumen] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      setResumen(await obtenerResumenPanel())
    } catch (e) {
      setError(e.message ?? 'No se pudo cargar el resumen.')
      setResumen(null)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  return { resumen, cargando, error, recargar }
}
