import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

/** Selector nativo estilizado, integrable con React Hook Form. */
const Select = forwardRef(function Select(
  { label, error, children, id, className = '', ...resto },
  ref
) {
  const selectId = id ?? resto.name

  return (
    <div className={className}>
      {label && (
        <label className="label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className="input appearance-none pr-10"
          {...resto}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
})

export default Select
