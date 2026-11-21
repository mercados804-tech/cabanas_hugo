import { useCallback, useEffect, useState } from 'react'
import { listarCabanas } from '../lib/datos'

/**
 * Carga las cabañas desde Supabase y expone una función para recargarlas.
 */
export function useCabanas() {
  const [cabanas, setCabanas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const recargar = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const datos = await listarCabanas()
      setCabanas(datos)
    } catch (e) {
      setError(e.message ?? 'No se pudieron cargar las cabañas.')
      setCabanas([])
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    recargar()
  }, [recargar])

  return { cabanas, cargando, error, recargar }
}
