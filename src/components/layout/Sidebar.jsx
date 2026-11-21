import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { MENU_PRINCIPAL, IconoMarca } from '../../utils/constants'
import { useAuth } from '../../context/AuthContext'

/**
 * Menú lateral de navegación.
 * En escritorio es fijo; en móvil se muestra como panel deslizable.
 */
export default function Sidebar({ abierto, onCerrar }) {
  const clasesPosicion = abierto
    ? 'translate-x-0'
    : '-translate-x-full lg:translate-x-0'

  return (
    <>
      {/* Fondo oscurecido al abrir el menú en móvil */}
      {abierto && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onCerrar}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--color-line)] bg-primary-800 text-white transition-transform duration-200 ${clasesPosicion}`}
      >
        {/* Encabezado / marca */}
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <IconoMarca className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">
              Gestión de Reservas
            </p>
            <p className="truncate text-xs text-primary-200">
              Cabañas Puerto Iguazú
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar menú"
            className="ml-auto rounded-md p-1 text-primary-100 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="scroll-thin flex-1 overflow-y-auto px-3 py-2">
          <ul className="space-y-1">
            {MENU_PRINCIPAL.map(({ nombre, ruta, icono: Icono, end }) => (
              <li key={ruta}>
                <NavLink
                  to={ruta}
                  end={end}
                  onClick={onCerrar}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-white text-primary-800 shadow-sm'
                        : 'text-primary-100 hover:bg-white/10 hover:text-white'
                    ].join(' ')
                  }
                >
                  <Icono className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {nombre}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Cierre de sesión */}
        <div className="border-t border-white/10 p-3">
          <BotonCerrarSesion onCerrar={onCerrar} />
        </div>
      </aside>
    </>
  )
}

/** Botón de cierre de sesión del menú lateral. */
function BotonCerrarSesion({ onCerrar }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function manejarCierre() {
    onCerrar?.()
    try {
      await signOut()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <button
      type="button"
      onClick={manejarCierre}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-100 transition-colors hover:bg-white/10 hover:text-white"
    >
      <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
      Cerrar sesión
    </button>
  )
}
