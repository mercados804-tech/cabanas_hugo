import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Alerta from '../components/ui/Alerta'
import EmptyState from '../components/ui/EmptyState'
import CabanaDisponibilidadCard from '../components/disponibilidad/CabanaDisponibilidadCard'
import { useCabanas } from '../hooks/useCabanas'
import { listarReservas } from '../lib/datos'
import { hoyISO, sumarDias } from '../utils/dates'

/** Orden de presentación de los resultados. */
const ORDEN = {
  disponible: 0,
  ocupada: 1,
  capacidad_insuficiente: 2,
  sin_capacidad: 3,
  inactiva: 4
}

export default function Disponibilidad() {
  const { cabanas, cargando: cargandoCabanas } = useCabanas()
  const navigate = useNavigate()

  const [ingreso, setIngreso] = useState(hoyISO())
  const [salida, setSalida] = useState(sumarDias(hoyISO(), 1))
  const [cantidad, setCantidad] = useState('')
  const [resultados, setResultados] = useState(null)
  const [consultando, setConsultando] = useState(false)
  const [aviso, setAviso] = useState('')
  const [error, setError] = useState('')

  async function consultar() {
    setAviso('')
    setError('')

    if (!ingreso || !salida) {
      setAviso('Ingresá la fecha de ingreso y la fecha de salida.')
      return
    }
    if (salida <= ingreso) {
      setAviso('La fecha de salida debe ser posterior a la fecha de ingreso.')
      return
    }

    const cantidadNumero = cantidad ? Number(cantidad) : null
    if (cantidad && (!/^\d+$/.test(cantidad) || cantidadNumero < 1)) {
      setAviso('La cantidad de huéspedes debe ser un número entero mayor a cero.')
      return
    }

    setConsultando(true)
    try {
      const reservas = await listarReservas({ desde: ingreso, hasta: salida })

      // Se agrupan las reservas que realmente se solapan con el rango pedido.
      const porCabana = new Map()
      for (const reserva of reservas) {
        if (reserva.estado === 'cancelada') continue
        const solapa =
          reserva.fecha_ingreso < salida && reserva.fecha_salida > ingreso
        if (!solapa) continue

        const lista = porCabana.get(reserva.cabana_id) ?? []
        lista.push(reserva)
        porCabana.set(reserva.cabana_id, lista)
      }

      const filas = cabanas.map((cabana) => {
        const conflictos = porCabana.get(cabana.id) ?? []

        if (!cabana.activa) return { cabana, estado: 'inactiva' }
        if (cabana.capacidad === null || cabana.capacidad === undefined) {
          return { cabana, estado: 'sin_capacidad' }
        }
        if (cantidadNumero && cantidadNumero > cabana.capacidad) {
          return { cabana, estado: 'capacidad_insuficiente' }
        }
        if (conflictos.length > 0) {
          return { cabana, estado: 'ocupada', reserva: conflictos[0] }
        }
        return { cabana, estado: 'disponible' }
      })

      filas.sort(
        (a, b) =>
          ORDEN[a.estado] - ORDEN[b.estado] ||
          a.cabana.nombre.localeCompare(b.cabana.nombre)
      )

      setResultados(filas)
    } catch (e) {
      setError(e.message ?? 'No se pudo realizar la consulta.')
      setResultados(null)
    } finally {
      setConsultando(false)
    }
  }

  function reservar(cabana) {
    navigate(
      `/reservas?cabana=${cabana.id}&ingreso=${ingreso}&salida=${salida}`
    )
  }

  const disponibles = resultados?.filter((f) => f.estado === 'disponible').length

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Disponibilidad"
        descripcion="Consulta rápida de cabañas libres para un rango de fechas."
      />

      <div className="card p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Input
            label="Fecha de ingreso"
            type="date"
            value={ingreso}
            onChange={(evento) => setIngreso(evento.target.value)}
          />
          <Input
            label="Fecha de salida"
            type="date"
            min={ingreso || undefined}
            value={salida}
            onChange={(evento) => setSalida(evento.target.value)}
          />
          <Input
            label="Cantidad de huéspedes (opcional)"
            type="number"
            min="1"
            inputMode="numeric"
            placeholder="Ej.: 4"
            value={cantidad}
            onChange={(evento) => setCantidad(evento.target.value)}
          />
          <div className="flex items-end">
            <Button
              className="w-full"
              icono={Search}
              cargando={consultando}
              onClick={consultar}
            >
              Consultar disponibilidad
            </Button>
          </div>
        </div>

        {aviso && (
          <div className="mt-4">
            <Alerta tipo="advertencia" onCerrar={() => setAviso('')}>
              {aviso}
            </Alerta>
          </div>
        )}
        {error && (
          <div className="mt-4">
            <Alerta tipo="error" onCerrar={() => setError('')}>
              {error}
            </Alerta>
          </div>
        )}
      </div>

      {resultados === null ? (
        <div className="card">
          <EmptyState
            icono={Search}
            titulo="Consultá la disponibilidad"
            mensaje="Ingresá un rango de fechas y, si lo deseás, la cantidad de huéspedes, y presioná Consultar disponibilidad."
          />
        </div>
      ) : resultados.length === 0 ? (
        <div className="card">
          <EmptyState
            icono={Search}
            titulo="No hay cabañas registradas"
            mensaje="Configurá las cabañas en la sección Cabañas para consultar la disponibilidad."
          />
        </div>
      ) : (
        <>
          <Alerta tipo={disponibles > 0 ? 'exito' : 'advertencia'}>
            {disponibles > 0
              ? `${disponibles} de ${resultados.length} ${
                  resultados.length === 1 ? 'cabaña' : 'cabañas'
                } disponible${disponibles === 1 ? '' : 's'} para el período consultado.`
              : 'Ninguna cabaña está disponible para el período consultado.'}
          </Alerta>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {resultados.map((fila) => (
              <CabanaDisponibilidadCard
                key={fila.cabana.id}
                cabana={fila.cabana}
                estado={fila.estado}
                reserva={fila.reserva}
                cantidad={cantidad}
                onReservar={reservar}
              />
            ))}
          </div>
        </>
      )}

      {cargandoCabanas && cabanas.length === 0 && (
        <p className="text-center text-sm text-slate-400">
          Cargando cabañas…
        </p>
      )}
    </div>
  )
}
