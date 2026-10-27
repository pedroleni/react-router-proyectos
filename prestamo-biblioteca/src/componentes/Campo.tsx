import type { ReactNode } from 'react'

// Una etiqueta, su campo y, si lo hay, el error que devolvió la API.
// El campo enlaza el error con aria-describedby={`${id}-error`}.
export default function Campo({
  id,
  etiqueta,
  error,
  children,
}: {
  id: string
  etiqueta: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {error && (
        <p id={`${id}-error`} className="error-campo">
          {error}
        </p>
      )}
    </div>
  )
}

export function propsDeError(id: string, error?: string) {
  return error ? { 'aria-invalid': true, 'aria-describedby': `${id}-error` } : {}
}
