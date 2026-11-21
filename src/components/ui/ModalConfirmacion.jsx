import Modal from './Modal'
import Button from './Button'
import Alerta from './Alerta'

/** Ventana de confirmación para acciones sensibles. */
export default function ModalConfirmacion({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Volver',
  variante = 'danger',
  procesando = false,
  onConfirmar,
  onCerrar
}) {
  return (
    <Modal
      abierto={abierto}
      titulo={titulo}
      ancho="sm"
      onCerrar={onCerrar}
      pie={
        <>
          <Button variant="outline" onClick={onCerrar} disabled={procesando}>
            {textoCancelar}
          </Button>
          <Button
            variant={variante}
            onClick={onConfirmar}
            cargando={procesando}
          >
            {textoConfirmar}
          </Button>
        </>
      }
    >
      <Alerta tipo={variante === 'danger' ? 'advertencia' : 'info'}>
        {mensaje}
      </Alerta>
    </Modal>
  )
}
