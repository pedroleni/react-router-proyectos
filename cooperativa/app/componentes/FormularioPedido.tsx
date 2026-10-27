import { useEffect, useRef } from 'react'
import { Form, useNavigation } from 'react-router'
import { DIAS, PUNTOS } from '~/reparto'

type Campo = 'punto' | 'dia' | 'telefono' | 'comentario' | 'cesta'

/** Lo que devuelve la action del pedido cuando algo no vale. */
export type ResultadoPedido = {
  errores: Partial<Record<Campo, string[]>>
  valores: Record<'punto' | 'dia' | 'telefono' | 'comentario', string>
}

/**
 * El formulario del pedido. Valida el servidor, con Zod; noValidate apaga los
 * globos del navegador para que se vean sus mensajes. Funciona sin JavaScript:
 * con errores, el servidor vuelve a pintar la página con lo que escribiste.
 */
export default function FormularioPedido({ token, resultado }: { token: string; resultado?: ResultadoPedido }) {
  const errores = resultado?.errores ?? {}
  const valores = resultado?.valores
  const navegacion = useNavigation()
  const enviando = navegacion.state === 'submitting'
  const formulario = useRef<HTMLFormElement>(null)

  // Tras un envío con errores, el foco va al primer campo que hay que corregir.
  useEffect(() => {
    formulario.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  }, [resultado])

  const error = (campo: Campo) =>
    errores[campo] ? (
      <p id={`pedido-${campo}-error`} className="error">
        {errores[campo][0]}
      </p>
    ) : null
  const describir = (campo: Campo) => (errores[campo] ? `pedido-${campo}-error` : undefined)

  return (
    <Form method="post" noValidate ref={formulario} className="formulario">
      {/* El token de la compra en curso, del loader: el mismo formulario no crea dos pedidos. */}
      <input type="hidden" name="token" value={token} />
      {errores.cesta && (
        <p role="alert" className="error">
          {errores.cesta[0]}
        </p>
      )}

      <fieldset aria-describedby={describir('punto')}>
        <legend>Dónde la recogerás</legend>
        {Object.entries(PUNTOS).map(([id, nombre], i) => (
          <label key={id} className="opcion">
            <input
              type="radio"
              name="punto"
              value={id}
              defaultChecked={valores?.punto === id}
              aria-invalid={errores.punto && i === 0 ? true : undefined}
            />{' '}
            {nombre}
          </label>
        ))}
        {error('punto')}
      </fieldset>

      <fieldset aria-describedby={describir('dia')}>
        <legend>Qué día</legend>
        {Object.entries(DIAS).map(([id, nombre], i) => (
          <label key={id} className="opcion">
            <input
              type="radio"
              name="dia"
              value={id}
              defaultChecked={valores?.dia === id}
              aria-invalid={errores.dia && i === 0 ? true : undefined}
            />{' '}
            El {nombre}
          </label>
        ))}
        {error('dia')}
      </fieldset>

      <div className="campo">
        <label htmlFor="pedido-telefono">Teléfono para avisarte si falta algo</label>
        <input
          id="pedido-telefono"
          name="telefono"
          type="tel"
          autoComplete="tel-national"
          inputMode="numeric"
          defaultValue={valores?.telefono}
          aria-invalid={errores.telefono ? true : undefined}
          aria-describedby={describir('telefono')}
        />
        {error('telefono')}
      </div>

      <div className="campo">
        <label htmlFor="pedido-comentario">Algo que debamos saber (opcional)</label>
        <textarea
          id="pedido-comentario"
          name="comentario"
          rows={2}
          defaultValue={valores?.comentario}
          aria-invalid={errores.comentario ? true : undefined}
          aria-describedby={describir('comentario')}
        />
        {error('comentario')}
      </div>

      <button type="submit" disabled={enviando}>
        {enviando ? 'Confirmando…' : 'Confirmar el pedido'}
      </button>
    </Form>
  )
}
