import { Suspense, useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, LogOut, Loader2 } from 'lucide-react'
import Sidebar from './Sidebar'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'

/** Indicador de carga del contenido mientras se descarga una sección. */
function CargandoSeccion() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24">
      <Loader2 className="h-6 w-6 animate-spin text-primary-700" />
      <p className="text-sm text-slate-500">Cargando sección…</p>
    </div>
  )
}

/** Título mostrado en la barra superior según la ruta activa. */
const TITULOS = {
  '/': 'Inicio',
  '/calendario': 'Calendario',
  '/reservas': 'Reservas',
  '/cabanas': 'Cabañas',
  '/disponibilidad': 'Disponibilidad'
}

/**
 * Estructura general de la aplicación autenticada:
 * menú lateral + barra superior + contenido de la ruta.
 */
export default function AppLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Cierra el menú móvil al cambiar de sección.
  useEffect(() => {
    setMenuAbierto(false)
  }, [location.pathname])

  const titulo = TITULOS[location.pathname] ?? 'Gestión de Reservas'

  async function cerrarSesion() {
    try {
      await signOut()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)]">
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      <div className="lg:pl-64">
        {/* Barra superior */}
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--color-line)] bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setMenuAbierto(true)}
            aria-label="Abrir menú"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <h2 className="text-base font-semibold text-slate-800">{titulo}</h2>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-xs text-slate-400">Administrador</p>
              <p className="max-w-[220px] truncate text-sm text-slate-600">
                {user?.email ?? ''}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icono={LogOut}
              onClick={cerrarSesion}
              className="hidden sm:inline-flex"
            >
              Salir
            </Button>
            <Button
              variant="outline"
              size="sm"
              icono={LogOut}
              onClick={cerrarSesion}
              aria-label="Cerrar sesión"
              className="sm:hidden"
            />
          </div>
        </header>

        {/* Contenido de la sección activa */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Suspense fallback={<CargandoSeccion />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
