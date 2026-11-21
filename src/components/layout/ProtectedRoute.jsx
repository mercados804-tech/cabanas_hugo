import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PantallaCargando from '../ui/PantallaCargando'

/**
 * Protege las rutas internas: si no hay sesión válida
 * redirige al inicio de sesión conservando el destino original.
 */
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <PantallaCargando mensaje="Verificando sesión…" />
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  return children
}
