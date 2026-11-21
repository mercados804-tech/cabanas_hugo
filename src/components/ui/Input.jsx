import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/**
 * Campo de texto del sistema.
 * - Integrable con React Hook Form mediante `forwardRef`.
 * - Si `esPassword` es verdadero, muestra el botón de ver/ocultar.
 */
const Input = forwardRef(function Input(
  { label, error, esPassword = false, id, className = '', ...resto },
  ref
) {
  const [visible, setVisible] = useState(false)
  const inputId = id ?? resto.name

  return (
    <div className={className}>
      {label && (
        <label className="label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          type={esPassword && !visible ? 'password' : 'text'}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`input ${esPassword ? 'pr-11' : ''}`}
          {...resto}
        />
        {esPassword && (
          <button
            type="button"
            onClick={() => setVisible((valor) => !valor)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
          >
            {visible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})

export default Input
