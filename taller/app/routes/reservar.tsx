import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { data, useFetcher } from 'react-router'
import { reservarSiHayCamas } from '~/datos/reservas.server'
import { FechaIsoReal, hoyEnSahagun } from '~/fechas'
import type { Route } from './+types/reservar'

const Reserva = z.object({
  nombre: z.string().trim().min(2, 'Escribe tu nombre.').max(80, 'El nombre no puede superar 80 caracteres.'),
  documento: z
    .string()
    .trim()
    .regex(/^\d{3}$/, 'Escribe exactamente las tres últimas cifras de tu documento.'),
  noche: FechaIsoReal.refine(
    (noche) => noche >= hoyEnSahagun(),
    'La noche no puede estar en el pasado.',
  ).refine((noche) => {
    const mes = Number(noche.slice(5, 7))
    return mes >= 3 && mes <= 10
  }, 'El albergue abre del 1 de marzo al 31 de octubre.'),
  personas: z.coerce
    .number()
    .int()
    .min(1, 'Reserva al menos una cama.')
    .max(6, 'Solo se pueden reservar seis camas juntas.'),
})

export type ResultadoReserva = {
  errores?: Record<string, string[] | undefined>
  valores?: Record<string, string>
  confirmado?: string
}

export async function action({ request }: Route.ActionArgs) {
  const formulario = await request.formData()
  const valores = Object.fromEntries([...formulario].map(([clave, valor]) => [clave, String(valor)]))
  const resultado = Reserva.safeParse(valores)
  // L21: flattenError convierte los issues de Zod en errores por campo que el formulario puede asociar.
  if (!resultado.success)
    return data<ResultadoReserva>(
      { errores: z.flattenError(resultado.error).fieldErrors, valores },
      { status: 400 },
    )
  const id = `r-${randomUUID()}`
  const guardada = await reservarSiHayCamas({
    ...resultado.data,
    id,
    documento: `***${resultado.data.documento}`,
    estado: 'reservada',
    credencial: null,
  })
  if (!guardada) {
    // L21: 409 distingue el conflicto de capacidad de un formulario inválido (400).
    return data<ResultadoReserva>(
      { errores: { noche: ['No quedan camas suficientes para esa noche.'] }, valores },
      { status: 409 },
    )
  }
  return data<ResultadoReserva>({ confirmado: id }, { status: 201 })
}

function errorDe(resultado: ResultadoReserva | undefined, campo: string): string | undefined {
  return resultado?.errores?.[campo]?.[0]
}

export function ReservaFormulario() {
  // L21: al no depender de Route.ComponentProps, createRoutesStub puede probar
  // este formulario con una action inventada y sus propios tipos de ruta.
  // useFetcher envía y recibe la action sin abandonar esta pantalla.
  const fetcher = useFetcher<ResultadoReserva>()
  const resultado = fetcher.data
  if (resultado?.confirmado)
    return (
      <p className="confirmacion" role="status">
        Reserva recibida. Tu referencia es <strong>{resultado.confirmado}</strong>.
      </p>
    )
  return (
    <fetcher.Form method="post" className="formulario">
      <div className="campo">
        <label htmlFor="nombre">Nombre</label>
        <input
          id="nombre"
          name="nombre"
          autoComplete="name"
          defaultValue={resultado?.valores?.nombre}
          aria-invalid={!!errorDe(resultado, 'nombre')}
          aria-describedby={errorDe(resultado, 'nombre') ? 'nombre-error' : undefined}
          required
        />
        {errorDe(resultado, 'nombre') && (
          <p id="nombre-error" className="error">
            {errorDe(resultado, 'nombre')}
          </p>
        )}
      </div>
      <div className="campo">
        <label htmlFor="documento">Tres últimas cifras del documento</label>
        <input
          id="documento"
          name="documento"
          inputMode="numeric"
          maxLength={3}
          defaultValue={resultado?.valores?.documento}
          aria-invalid={!!errorDe(resultado, 'documento')}
          aria-describedby={errorDe(resultado, 'documento') ? 'documento-error' : 'documento-ayuda'}
          required
        />
        <small id="documento-ayuda">No guardamos el documento completo.</small>
        {errorDe(resultado, 'documento') && (
          <p id="documento-error" className="error">
            {errorDe(resultado, 'documento')}
          </p>
        )}
      </div>
      <div className="campos-dobles">
        <div className="campo">
          <label htmlFor="noche-reserva">Noche</label>
          <input
            id="noche-reserva"
            name="noche"
            type="date"
            defaultValue={resultado?.valores?.noche}
            aria-invalid={!!errorDe(resultado, 'noche')}
            aria-describedby={errorDe(resultado, 'noche') ? 'noche-error' : undefined}
            required
          />
          {errorDe(resultado, 'noche') && (
            <p id="noche-error" className="error">
              {errorDe(resultado, 'noche')}
            </p>
          )}
        </div>
        <div className="campo">
          <label htmlFor="personas">Personas</label>
          <input
            id="personas"
            name="personas"
            type="number"
            min="1"
            max="6"
            defaultValue={resultado?.valores?.personas ?? '1'}
            aria-invalid={!!errorDe(resultado, 'personas')}
            aria-describedby={errorDe(resultado, 'personas') ? 'personas-error' : undefined}
            required
          />
          {errorDe(resultado, 'personas') && (
            <p id="personas-error" className="error">
              {errorDe(resultado, 'personas')}
            </p>
          )}
        </div>
      </div>
      <button type="submit" disabled={fetcher.state !== 'idle'}>
        {fetcher.state === 'submitting' ? 'Reservando…' : 'Reservar'}
      </button>
    </fetcher.Form>
  )
}

export default function Reservar() {
  return (
    <main className="pagina estrecha">
      <title>Reservar cama | El Cea</title>
      <h1>Reservar una cama</h1>
      <p>La reserva queda pendiente hasta que el albergue la confirme.</p>
      <ReservaFormulario />
    </main>
  )
}
