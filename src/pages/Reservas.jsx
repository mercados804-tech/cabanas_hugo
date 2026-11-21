import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ClipboardList, History, Plus, RefreshCw } from 'lucide-react'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Alerta from '../components/ui/Alerta'
import EmptyState from '../components/ui/EmptyState'
import ModalConfirmacion from '../components/ui/ModalConfirmacion'
import ReservaFiltros from '../components/reservas/ReservaFiltros'
import ReservaTabla from '../components/reservas/ReservaTabla'
import ReservaFormModal from '../components/reservas/ReservaFormModal'
import ReservaDetalleModal from '../components/reservas/ReservaDetalleModal'
import HistorialFiltros from '../components/reservas/HistorialFiltros'
import HistorialResumen from '../components/reservas/HistorialResumen'
import { useReservas } from '../hooks/useReservas'
import { useCabanas } from '../hooks/useCabanas'
import { useDebounce } from '../hooks/useDebounce'
import {
  actualizarReserva,
  cancelarReserva,
  crearReserva
} from '../lib/datos'
import { formatearFecha } from '../utils/dates'

/** Pestañas de la sección Reservas. */
const VISTAS = [
  { valor: 'reservas', etiqueta: 'Reservas', icono: ClipboardList },
  { valor: 'historial', etiqueta: 'Historial', icono: History }
]

export default function Reservas() {
  const [searchParams] = useSearchParams()
  const { cabanas } = useCabanas()

  const cabanaParam = searchParams.get('cabana') ?? ''
  const ingresoParam = searchParams.get('ingreso') ?? ''
  const salidaParam = searchParams.get('salida') ?? ''

  const [vista, setVista] = useState('reservas')
  const esHistorial = vista === 'historial'

  // Filtros de la vista "Reservas".
  const [texto, setTexto] = useState('')
  const [cabanaId, setCabanaId] = useState(cabanaParam)
  const [estado, setEstado] = useState('')
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [ordenAsc, setOrdenAsc] = useState(false)
  const textoDiferido = useDebounce(texto, 350)

  // Filtros de la vista "Historial".
  const [hTexto, setHTexto] = useState('')
  const [hCabanaId, setHCabanaId] = useState('')
  const [hProcedencia, setHProcedencia] = useState('')
  const [hEstados, setHEstados] = useState([])
  const [hDesde, setHDesde] = useState('')
  const [hHasta, setHHasta] = useState('')
  const [hOrdenAsc, setHOrdenAsc] = useState(false)
  const hTextoDiferido = useDebounce(hTexto, 350)

  const { reservas, cargando, error, recargar } = useReservas(
    esHistorial
      ? {
          texto: hTextoDiferido,
          cabanaId: hCabanaId,
          estados: hEstados,
          procedencia: hProcedencia,
          desde: hDesde,
          hasta: hHasta,
          ordenAsc: hOrdenAsc
        }
      : {
          texto: textoDiferido,
          cabanaId,
          estado,
          desde,
          hasta,
          ordenAsc
        }
  )

  const [modalAbierto, setModalAbierto] = useState(Boolean(ingresoParam))
  const [reservaEnEdicion, setReservaEnEdicion] = useState(null)
  const [ingresoInicial, setIngresoInicial] = useState(ingresoParam)
  const [salidaInicial, setSalidaInicial] = useState(salidaParam)
  const [detalle, setDetalle] = useState(null)
  const [cancelando, setCancelando] = useState(null)
  const [procesandoCancelacion, setProcesandoCancelacion] = useState(false)
  const [exito, setExito] = useState('')
  const [errorAccion, setErrorAccion] = useState('')

  function limpiarFiltros() {
    setTexto('')
    setCabanaId('')
    setEstado('')
    setDesde('')
    setHasta('')
    setOrdenAsc(false)
  }

  function limpiarFiltrosHistorial() {
    setHTexto('')
    setHCabanaId('')
    setHProcedencia('')
    setHEstados([])
    setHDesde('')
    setHHasta('')
    setHOrdenAsc(false)
  }

  function alternarEstado(valor) {
    setHEstados((actuales) =>
      actuales.includes(valor)
        ? actuales.filter((item) => item !== valor)
        : [...actuales, valor]
    )
  }

  function abrirNueva() {
    setReservaEnEdicion(null)
    setIngresoInicial('')
    setSalidaInicial('')
    setErrorAccion('')
    setModalAbierto(true)
  }

  function abrirEditar(reserva) {
    setDetalle(null)
    setReservaEnEdicion(reserva)
    setIngresoInicial('')
    setSalidaInicial('')
    setErrorAccion('')
    setModalAbierto(true)
  }

  async function guardar(datos) {
    const cabana = cabanas.find((c) => c.id === datos.cabana_id)?.nombre
    if (reservaEnEdicion) {
      await actualizarReserva(reservaEnEdicion.id, datos, cabana)
      setExito('La reserva se actualizó correctamente.')
    } else {
      await crearReserva(datos, cabana)
      setExito('La reserva se registró correctamente.')
    }
    setModalAbierto(false)
    setReservaEnEdicion(null)
    setIngresoInicial('')
    setSalidaInicial('')
    await recargar()
  }

  function solicitarCancelacion(reserva) {
    setDetalle(null)
    setCancelando(reserva)
  }

  async function confirmarCancelacion() {
    if (!cancelando) return
    setProcesandoCancelacion(true)
    setErrorAccion('')
    try {
      await cancelarReserva(cancelando.id)
      setExito('La reserva se canceló correctamente.')
      setCancelando(null)
      await recargar()
    } catch (e) {
      setErrorAccion(e.message)
    } finally {
      setProcesandoCancelacion(false)
    }
  }

  const sinCabanas = cabanas.length === 0 && !cargando
  const cabanaInicial = esHistorial ? hCabanaId : cabanaId

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Reservas"
        descripcion="Registro, consulta, edición y cancelación de reservas."
        acciones={
          <>
            <Button
              variant="outline"
              size="sm"
              icono={RefreshCw}
              onClick={recargar}
              cargando={cargando}
            >
              Actualizar
            </Button>
            <Button
              size="sm"
              icono={Plus}
              onClick={abrirNueva}
              disabled={sinCabanas}
            >
              Nueva reserva
            </Button>
          </>
        }
      />

      {exito && (
        <Alerta tipo="exito" onCerrar={() => setExito('')}>
          {exito}
        </Alerta>
      )}
      {error && <Alerta tipo="error">{error}</Alerta>}
      {errorAccion && (
        <Alerta tipo="error" onCerrar={() => setErrorAccion('')}>
          {errorAccion}
        </Alerta>
      )}

      {sinCabanas ? (
        <div className="card">
          <EmptyState
            icono={ClipboardList}
            titulo="Todavía no hay cabañas configuradas"
            mensaje="Antes de registrar reservas, ejecutá la migración 0001 y configurá la capacidad de cada cabaña en la sección Cabañas."
          />
        </div>
      ) : (
        <>
          <div
            role="tablist"
            aria-label="Vistas de reservas"
            className="inline-flex rounded-lg border border-[var(--color-line)] bg-white p-1"
          >
            {VISTAS.map(({ valor, etiqueta, icono: Icono }) => (
              <button
                key={valor}
                type="button"
                role="tab"
                aria-selected={vista === valor}
                onClick={() => setVista(valor)}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                  vista === valor
                    ? 'bg-primary-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icono className="h-4 w-4" aria-hidden="true" />
                {etiqueta}
              </button>
            ))}
          </div>

          {esHistorial ? (
            <>
              <HistorialFiltros
                texto={hTexto}
                onTexto={setHTexto}
                cabanaId={hCabanaId}
                onCabana={setHCabanaId}
                procedencia={hProcedencia}
                onProcedencia={setHProcedencia}
                estados={hEstados}
                onAlternarEstado={alternarEstado}
                desde={hDesde}
                onDesde={setHDesde}
                hasta={hHasta}
                onHasta={setHHasta}
                ordenAsc={hOrdenAsc}
                onOrden={setHOrdenAsc}
                cabanas={cabanas}
                onLimpiar={limpiarFiltrosHistorial}
              />

              <HistorialResumen reservas={reservas} cargando={cargando} />

              {!cargando && reservas.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icono={History}
                    titulo="El historial está vacío"
                    mensaje="No hay reservas que coincidan con los filtros seleccionados."
                  />
                </div>
              ) : (
                <ReservaTabla
                  reservas={reservas}
                  cargando={cargando}
                  onVer={setDetalle}
                  soloLectura
                />
              )}
            </>
          ) : (
            <>
              <ReservaFiltros
                texto={texto}
                onTexto={setTexto}
                cabanaId={cabanaId}
                onCabana={setCabanaId}
                estado={estado}
                onEstado={setEstado}
                desde={desde}
                onDesde={setDesde}
                hasta={hasta}
                onHasta={setHasta}
                ordenAsc={ordenAsc}
                onOrden={setOrdenAsc}
                cabanas={cabanas}
                onLimpiar={limpiarFiltros}
              />

              {!cargando && reservas.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icono={ClipboardList}
                    titulo="No se encontraron reservas"
                    mensaje="Ajustá los filtros de búsqueda o registrá una nueva reserva."
                  />
                </div>
              ) : (
                <ReservaTabla
                  reservas={reservas}
                  cargando={cargando}
                  onVer={setDetalle}
                  onEditar={abrirEditar}
                  onCancelar={solicitarCancelacion}
                />
              )}
            </>
          )}
        </>
      )}

      <ReservaFormModal
        abierto={modalAbierto}
        reserva={reservaEnEdicion}
        cabanas={cabanas}
        cabanaInicial={cabanaInicial}
        ingresoInicial={ingresoInicial}
        salidaInicial={salidaInicial}
        onGuardar={guardar}
        onCerrar={() => {
          setModalAbierto(false)
          setReservaEnEdicion(null)
          setIngresoInicial('')
          setSalidaInicial('')
        }}
      />

      <ReservaDetalleModal
        abierto={Boolean(detalle)}
        reserva={detalle}
        onEditar={abrirEditar}
        onCancelar={solicitarCancelacion}
        onCerrar={() => setDetalle(null)}
      />

      <ModalConfirmacion
        abierto={Boolean(cancelando)}
        titulo="Cancelar reserva"
        mensaje={
          cancelando
            ? `Se cancelará la reserva de ${cancelando.nombre_huesped} en ${
                cancelando.cabanas?.nombre ?? 'la cabaña'
              } del ${formatearFecha(cancelando.fecha_ingreso)} al ${formatearFecha(
                cancelando.fecha_salida
              )}. La reserva quedará registrada en el historial y ya no bloqueará esas fechas.`
            : ''
        }
        textoConfirmar="Cancelar reserva"
        textoCancelar="Volver"
        variante="danger"
        procesando={procesandoCancelacion}
        onConfirmar={confirmarCancelacion}
        onCerrar={() => setCancelando(null)}
      />
    </div>
  )
}
