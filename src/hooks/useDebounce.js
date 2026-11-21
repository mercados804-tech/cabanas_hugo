import { useEffect, useState } from 'react'

/** Devuelve el valor recibido después de un tiempo sin cambios. */
export function useDebounce(valor, espera = 350) {
  const [valorDiferido, setValorDiferido] = useState(valor)

  useEffect(() => {
    const temporizador = setTimeout(() => setValorDiferido(valor), espera)
    return () => clearTimeout(temporizador)
  }, [valor, espera])

  return valorDiferido
}
