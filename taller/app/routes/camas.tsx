import { data, Form } from 'react-router'
import { camasLibres } from '~/datos/reservas.server'
import { FechaIsoReal, hoyEnSahagun } from '~/fechas'
import type { Route } from './+types/camas'

export async function loader({ request }: Route.LoaderArgs) {
  const recibida = new URL(request.url).searchParams.get('noche')
  const validada = FechaIsoReal.safeParse(recibida ?? hoyEnSahagun())
  if (!validada.success) throw data({ mensaje: 'La noche no es una fecha válida.' }, { status: 400 })
  const noche = validada.data
  return { noche, libres: await camasLibres(noche) }
}

export function headers() {
  // TODO (lección 17): añade una caché corta para navegador y proxy. Busca la
  // exportación headers de un módulo de ruta y stale-while-revalidate.
  return {}
}

export default function Camas({ loaderData }: Route.ComponentProps) {
  return (
    <main className="pagina estrecha">
      <title>Camas libres | El Cea</title>
      <h1>Camas libres</h1>
      <Form method="get" className="formulario en-linea">
        <div className="campo">
          <label htmlFor="noche">Noche</label>
          <input id="noche" type="date" name="noche" defaultValue={loaderData.noche} required />
        </div>
        <button type="submit">Consultar</button>
      </Form>
      <p className="resultado-camas">
        <strong>{loaderData.libres}</strong> camas libres para la noche del{' '}
        <time dateTime={loaderData.noche}>{loaderData.noche}</time>.
      </p>
    </main>
  )
}
