import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save } from 'lucide-react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import Alerta from '../ui/Alerta'
import { buscarConflictos } from '../../lib/datos'
import { calcularNoches, formatearFecha } from '../../utils/dates'
import { ESTADOS_RESERVA, PROCEDENCIAS } from '../../utils/constants'

/** Validaciones del formulario de reserva. */
const esquema = z
  .object({
    cabana_id: z.string().min(1, 'Seleccioná la cabaña.'),
    nombre_huesped: z
      .string()
      .trim()
      .min(3, 'Ingresá el nombre y apellido del huésped.'),
    dni: z
      .string()
      .trim()
      .regex(/^[0-9]{7,9}$/, 'El DNI debe tener entre 7 y 9 números.'),
    telefono: z
      .string()
      .trim()
      .min(6, 'Ingresá un teléfono de contacto válido.'),
    procedencia: z.enum(['personal_militar', 'civil'], {
      message: 'Seleccioná la procedencia.'
    }),
    cantidad_huespedes: z
      .string()
      .trim()
      .min(1, 'Ingresá la cantidad de huéspedes.')
      .refine((valor) => /^\d+$/.test(valor), 'Ingresá solo números enteros.')
      .refine(
        (valor) => Number(valor) >= 1,
        'Debe haber al menos un huésped.'
      ),
    fecha_ingreso: z.string().min(1, 'Seleccioná la fecha de ingreso.'),
    fecha_salida: z.string().min(1, 'Seleccioná la fecha de salida.'),
    estado: z.enum(['pendiente', 'confirmada', 'finalizada', 'cancelada']),
    observaciones: z
      .string()
      .trim()
      .max(500, 'Las observaciones no pueden superar los 500 caracteres.')
      .optional()
  })
  .superRefine((datos, ctx) => {
    if (
      datos.fecha_ingreso &&
      datos.fecha_salida &&
      datos.fecha_salida <= datos.fecha_ingreso
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fecha_salida'],
        message: 'La fecha de salida debe ser posterior a la de ingreso.'
      })
    }
  })

/**
 * Ventana para registrar o editar una reserva.
 * Antes de guardar verifica superposición de fechas y capacidad de la cabaña.
 */
export default function ReservaFormModal({
  abierto,
  reserva,
  cabanas,
  cabanaInicial = '',
  ingresoInicial = '',
  salidaInicial = '',
  onGuardar,
  onCerrar
}) {
  const [errorGeneral, setErrorGeneral] = useState('')
  const [verificando, setVerificando] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      cabana_id: '',
      nombre_huesped: '',
      dni: '',
      telefono: '',
      procedencia: 'personal_militar',
      cantidad_huespedes: '',
      fecha_ingreso: '',
      fecha_salida: '',
      estado: 'pendiente',
      observaciones: ''
    }
  })

  // Carga los datos al abrir: los de la reserva a editar o un formulario vacío.
  useEffect(() => {
    if (!abierto) return
    reset({
      cabana_id: reserva?.cabana_id ?? cabanaInicial ?? '',
      nombre_huesped: reserva?.nombre_huesped ?? '',
      dni: reserva?.dni ?? '',
      telefono: reserva?.telefono ?? '',
      procedencia: reserva?.procedencia ?? 'personal_militar',
      cantidad_huespedes: reserva ? String(reserva.cantidad_huespedes) : '',
      fecha_ingreso: reserva?.fecha_ingreso ?? ingresoInicial ?? '',
      fecha_salida: reserva?.fecha_salida ?? salidaInicial ?? '',
      estado: reserva?.estado ?? 'pendiente',
      observaciones: reserva?.observaciones ?? ''
    })
    setErrorGeneral('')
  }, [abierto, reserva, cabanaInicial, ingresoInicial, salidaInicial, reset])

  const ingresoSel = watch('fecha_ingreso')
  const salidaSel = watch('fecha_salida')
  const cabanaSelId = watch('cabana_id')
  const cabanaSel = cabanas.find((cabana) => cabana.id === cabanaSelId)
  const noches = calcularNoches(ingresoSel, salidaSel)

  async function enviar(datos) {
    setErrorGeneral('')

    const cantidad = Number(datos.cantidad_huespedes)

    // Control de capacidad y estado de la cabaña (además del control de la base).
    if (cabanaSel) {
      if (cabanaSel.capacidad === null || cabanaSel.capacidad === undefined) {
        setErrorGeneral(
          `La ${cabanaSel.nombre} todavía no tiene la capacidad configurada. Configurala en la sección Cabañas antes de registrar reservas.`
        )
        return
      }
      if (cantidad > cabanaSel.capacidad) {
        setErrorGeneral(
          `La ${cabanaSel.nombre} admite hasta ${cabanaSel.capacidad} ${
            cabanaSel.capacidad === 1 ? 'huésped' : 'huéspedes'
          } y se intentaron asignar ${cantidad}.`
        )
        return
      }
      if (!cabanaSel.activa) {
        setErrorGeneral(
          `La ${cabanaSel.nombre} está inactiva y no admite reservas nuevas.`
        )
        return
      }
    }

    // Control de superposición de fechas.
    setVerificando(true)
    try {
      const conflictos = await buscarConflictos(
        datos.cabana_id,
        datos.fecha_ingreso,
        datos.fecha_salida,
        reserva?.id ?? null
      )

      if (conflictos.length > 0) {
        const detalle = conflictos
          .map(
            (c) =>
              `${c.nombre_huesped} (${formatearFecha(c.fecha_ingreso)} al ${formatearFecha(c.fecha_salida)})`
          )
          .join('; ')
        setErrorGeneral(
          `La ${cabanaSel?.nombre ?? 'cabaña'} ya tiene ${
            conflictos.length === 1 ? 'una reserva' : 'reservas'
          } en las fechas seleccionadas: ${detalle}.`
        )
        return
      }

      await onGuardar({
        cabana_id: datos.cabana_id,
        nombre_huesped: datos.nombre_huesped.trim(),
        dni: datos.dni.trim(),
        telefono: datos.telefono.trim(),
        procedencia: datos.procedencia,
        cantidad_huespedes: cantidad,
        fecha_ingreso: datos.fecha_ingreso,
        fecha_salida: datos.fecha_salida,
        estado: datos.estado,
        observaciones: datos.observaciones?.trim()
          ? datos.observaciones.trim()
          : null
      })
    } catch (e) {
      setErrorGeneral(e.message)
    } finally {
      setVerificando(false)
    }
  }

  const procesando = isSubmitting || verificando

  return (
    <Modal
      abierto={abierto}
      titulo={reserva ? 'Editar reserva' : 'Nueva reserva'}
      descripcion="La cabaña queda ocupada desde el día de ingreso hasta el día anterior a la salida."
      ancho="lg"
      onCerrar={onCerrar}
      pie={
        <>
          <Button variant="outline" onClick={onCerrar} disabled={procesando}>
            Cancelar
          </Button>
          <Button
            icono={Save}
            cargando={procesando}
            disabled={procesando}
            onClick={handleSubmit(enviar)}
          >
            {reserva ? 'Guardar cambios' : 'Registrar reserva'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(enviar)} className="space-y-4" noValidate>
        {errorGeneral && (
          <Alerta tipo="error" onCerrar={() => setErrorGeneral('')}>
            {errorGeneral}
          </Alerta>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Cabaña"
            error={errors.cabana_id?.message}
            {...register('cabana_id')}
          >
            <option value="">Seleccionar cabaña…</option>
            {cabanas.map((cabana) => (
              <option key={cabana.id} value={cabana.id}>
                {cabana.nombre}
                {cabana.capacidad ? ` · hasta ${cabana.capacidad} huéspedes` : ''}
                {cabana.activa ? '' : ' (inactiva)'}
              </option>
            ))}
          </Select>

          <Select label="Estado" error={errors.estado?.message} {...register('estado')}>
            {ESTADOS_RESERVA.map((estado) => (
              <option key={estado.valor} value={estado.valor}>
                {estado.etiqueta}
              </option>
            ))}
          </Select>

          <Input
            label="Nombre y apellido del huésped"
            className="sm:col-span-2"
            placeholder="Ej.: Juan Pérez"
            error={errors.nombre_huesped?.message}
            {...register('nombre_huesped')}
          />

          <Input
            label="DNI"
            inputMode="numeric"
            placeholder="Ej.: 30123456"
            error={errors.dni?.message}
            {...register('dni')}
          />

          <Input
            label="Teléfono"
            inputMode="tel"
            placeholder="Ej.: 3757 401234"
            error={errors.telefono?.message}
            {...register('telefono')}
          />

          <Select
            label="Procedencia"
            error={errors.procedencia?.message}
            {...register('procedencia')}
          >
            {PROCEDENCIAS.map((procedencia) => (
              <option key={procedencia.valor} value={procedencia.valor}>
                {procedencia.etiqueta}
              </option>
            ))}
          </Select>

          <Input
            label="Cantidad de huéspedes"
            type="number"
            min="1"
            inputMode="numeric"
            placeholder="Ej.: 4"
            error={errors.cantidad_huespedes?.message}
            {...register('cantidad_huespedes')}
          />

          <Input
            label="Fecha de ingreso"
            type="date"
            error={errors.fecha_ingreso?.message}
            {...register('fecha_ingreso')}
          />

          <Input
            label="Fecha de salida"
            type="date"
            min={ingresoSel || undefined}
            error={errors.fecha_salida?.message}
            {...register('fecha_salida')}
          />

          <Textarea
            label="Observaciones (opcional)"
            className="sm:col-span-2"
            rows={3}
            placeholder="Detalles de la estadía, requerimientos especiales, etc."
            error={errors.observaciones?.message}
            {...register('observaciones')}
          />
        </div>

        {noches > 0 && (
          <p className="rounded-lg bg-surface px-3.5 py-2.5 text-sm text-slate-600">
            Estadía de <strong>{noches}</strong>{' '}
            {noches === 1 ? 'noche' : 'noches'} · desde{' '}
            {formatearFecha(ingresoSel)} hasta {formatearFecha(salidaSel)}.
          </p>
        )}
      </form>
    </Modal>
  )
}
