import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save } from 'lucide-react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Button from '../ui/Button'
import Alerta from '../ui/Alerta'

/** Validación de la configuración de una cabaña. */
const esquema = z.object({
  capacidad: z
    .string()
    .trim()
    .min(1, 'Ingresá la capacidad máxima de la cabaña.')
    .refine((valor) => /^\d+$/.test(valor), 'Ingresá solo números enteros.')
    .refine(
      (valor) => Number(valor) >= 1 && Number(valor) <= 50,
      'La capacidad debe estar entre 1 y 50 huéspedes.'
    ),
  descripcion: z
    .string()
    .trim()
    .max(300, 'La descripción no puede superar los 300 caracteres.')
    .optional(),
  activa: z.boolean()
})

/** Ventana para configurar capacidad, descripción y estado de una cabaña. */
export default function CabanaFormModal({ abierto, cabana, onGuardar, onCerrar }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: { capacidad: '', descripcion: '', activa: true }
  })

  // Carga los datos de la cabaña cada vez que se abre la ventana.
  useEffect(() => {
    if (!abierto || !cabana) return
    reset({
      capacidad: cabana.capacidad === null ? '' : String(cabana.capacidad),
      descripcion: cabana.descripcion ?? '',
      activa: Boolean(cabana.activa)
    })
  }, [abierto, cabana, reset])

  async function enviar(datos) {
    await onGuardar(cabana.id, {
      capacidad: Number(datos.capacidad),
      descripcion: datos.descripcion?.trim() ? datos.descripcion.trim() : null,
      activa: datos.activa
    })
  }

  return (
    <Modal
      abierto={abierto}
      titulo={cabana ? `Configurar ${cabana.nombre}` : 'Configurar cabaña'}
      descripcion="Estos datos se usan para controlar la cantidad máxima de huéspedes admitidos."
      onCerrar={onCerrar}
      pie={
        <>
          <Button variant="outline" onClick={onCerrar} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            icono={Save}
            cargando={isSubmitting}
            disabled={isSubmitting}
            onClick={handleSubmit(enviar)}
          >
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </Button>
        </>
      }
    >
      <form
        onSubmit={handleSubmit(enviar)}
        className="space-y-4"
        noValidate
      >
        <Input
          label="Capacidad máxima (huéspedes)"
          type="number"
          min="1"
          max="50"
          inputMode="numeric"
          placeholder="Ej.: 4"
          error={errors.capacidad?.message}
          {...register('capacidad')}
        />

        <Textarea
          label="Descripción (opcional)"
          rows={3}
          placeholder="Referencias de la cabaña, ubicación interna, observaciones de mantenimiento…"
          error={errors.descripcion?.message}
          {...register('descripcion')}
        />

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-line)] px-3.5 py-3">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-700 focus:ring-primary-500"
            {...register('activa')}
          />
          <span>
            <span className="block text-sm font-medium text-slate-700">
              Cabaña activa
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              Una cabaña inactiva no admite reservas nuevas.
            </span>
          </span>
        </label>

        <Alerta tipo="info">
          La capacidad debe configurarse antes de registrar reservas. Mientras
          esté vacía, el sistema impedirá asignar huéspedes a esta cabaña.
        </Alerta>
      </form>
    </Modal>
  )
}
