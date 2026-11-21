import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, RefreshCw } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import CabanaCard from '../components/cabanas/CabanaCard'
import CabanaFormModal from '../components/cabanas/CabanaFormModal'
import Alerta from '../components/ui/Alerta'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import { useCabanas } from '../hooks/useCabanas'
import { actualizarCabana } from '../lib/datos'

export default function Cabanas() {
  const { cabanas, cargando, error, recargar } = useCabanas()
  const [cabanaEnEdicion, setCabanaEnEdicion] = useState(null)
  const [exito, setExito] = useState('')
  const [errorAccion, setErrorAccion] = useState('')
  const navigate = useNavigate()

  async function guardar(id, cambios) {
    setErrorAccion('')
    setExito('')
    try {
      await actualizarCabana(id, cambios)
      setCabanaEnEdicion(null)
      setExito('Los datos de la cabaña se guardaron correctamente.')
      await recargar()
    } catch (e) {
      setErrorAccion(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Cabañas"
        descripcion="Configuración de las cuatro cabañas y sus capacidades."
        acciones={
          <Button
            variant="outline"
            size="sm"
            icono={RefreshCw}
            onClick={recargar}
            cargando={cargando}
          >
            Actualizar
          </Button>
        }
      />

      {exito && <Alerta tipo="exito" onCerrar={() => setExito('')}>{exito}</Alerta>}
      {error && <Alerta tipo="error">{error}</Alerta>}
      {errorAccion && (
        <Alerta tipo="error" onCerrar={() => setErrorAccion('')}>
          {errorAccion}
        </Alerta>
      )}

      {cargando && cabanas.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((numero) => (
            <div key={numero} className="card h-48 animate-pulse bg-white" />
          ))}
        </div>
      ) : cabanas.length === 0 ? (
        <div className="card">
          <EmptyState
            icono={Home}
            titulo="No hay cabañas registradas"
            mensaje="Ejecutá la migración 0001 en Supabase para crear las cuatro cabañas del sistema."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cabanas.map((cabana) => (
            <CabanaCard
              key={cabana.id}
              cabana={cabana}
              onConfigurar={setCabanaEnEdicion}
              onVerReservas={(seleccionada) =>
                navigate(`/reservas?cabana=${seleccionada.id}`)
              }
            />
          ))}
        </div>
      )}

      <CabanaFormModal
        abierto={Boolean(cabanaEnEdicion)}
        cabana={cabanaEnEdicion}
        onGuardar={guardar}
        onCerrar={() => {
          setCabanaEnEdicion(null)
          setErrorAccion('')
        }}
      />
    </div>
  )
}
