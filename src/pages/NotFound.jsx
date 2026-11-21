import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Button from '../components/ui/Button'

export default function NotFound() {
  return (
    <div className="card flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
        <Compass className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="text-lg font-semibold text-slate-800">
        Sección no encontrada
      </h1>
      <p className="max-w-md text-sm text-slate-500">
        La dirección solicitada no existe o fue movida.
      </p>
      <Link to="/" className="mt-2">
        <Button variant="secondary">Volver a Inicio</Button>
      </Link>
    </div>
  )
}
