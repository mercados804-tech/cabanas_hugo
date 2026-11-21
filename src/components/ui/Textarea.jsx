import { forwardRef } from 'react'

/** Área de texto estilizada, integrable con React Hook Form. */
const Textarea = forwardRef(function Textarea(
  { label, error, id, className = '', rows = 3, ...resto },
  ref
) {
  const textareaId = id ?? resto.name

  return (
    <div className={className}>
      {label && (
        <label className="label" htmlFor={textareaId}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        ref={ref}
        rows={rows}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        className="input resize-y"
        {...resto}
      />
      {error && (
        <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})

export default Textarea
