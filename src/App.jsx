import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'

// Las secciones internas se cargan bajo demanda para reducir el
// tamaño de la carga inicial de la aplicación.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Calendario = lazy(() => import('./pages/Calendario'))
const Reservas = lazy(() => import('./pages/Reservas'))
const Cabanas = lazy(() => import('./pages/Cabanas'))
const Disponibilidad = lazy(() => import('./pages/Disponibilidad'))
const NotFound = lazy(() => import('./pages/NotFound'))

/**
 * Definición de rutas de la aplicación.
 * Todas las rutas internas quedan protegidas por ProtectedRoute.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="calendario" element={<Calendario />} />
        <Route path="reservas" element={<Reservas />} />
        <Route path="cabanas" element={<Cabanas />} />
        <Route path="disponibilidad" element={<Disponibilidad />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
