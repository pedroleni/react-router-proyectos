import { href, Link } from 'react-router'
import { hospitaleroContext, sesionContext } from '~/contexto.server'
import { leerReservas, reservasDeNoche } from '~/datos/reservas.server'
import { hoyEnSahagun } from '~/fechas'
import type { Route } from './+types/hoy'

export async function loader({ context }: Route.LoaderArgs) {
  const noche = hoyEnSahagun()
  const hospitalero = context.get(hospitaleroContext)
  const sesion = context.get(sesionContext)
  const reservas = await reservasDeNoche(noche)
  const proximas = (await leerReservas())
    .filter((reserva) => reserva.noche > noche && reserva.estado !== 'anulada')
    .sort((a, b) => a.noche.localeCompare(b.noche))
  return { noche, hospitalero, reservas, proximas, aviso: sesion.get('aviso') ?? null }
}

export default function Hoy({ loaderData }: Route.ComponentProps) {
  return (
    <main className="pagina zona-contenido">
      <title>Reservas de hoy | El Cea</title>
      <header className="cabecera-pagina">
        <h1>Reservas de esta noche</h1>
        <p>
          <time dateTime={loaderData.noche}>{loaderData.noche}</time>
        </p>
      </header>
      <p className={loaderData.aviso ? 'confirmacion' : undefined} aria-live="polite">
        {loaderData.aviso ?? ''}
      </p>
      {loaderData.reservas.length === 0 ? (
        <p className="estado-vacio">Todavía no hay reservas para esta noche.</p>
      ) : (
        <div className="reservas">
          {loaderData.reservas.map((reserva) => (
            <article key={reserva.id}>
              <div>
                <h2>
                  <Link to={href('/hospitaleros/reservas/:id', { id: reserva.id })}>{reserva.nombre}</Link>
                </h2>
                <p>
                  {reserva.personas} {reserva.personas === 1 ? 'persona' : 'personas'} · documento{' '}
                  {reserva.documento}
                </p>
              </div>
              <span className={`estado ${reserva.estado}`}>{reserva.estado}</span>
            </article>
          ))}
        </div>
      )}
      <section className="proximas">
        <h2>Próximas noches</h2>
        {loaderData.proximas.length === 0 ? (
          <p>No hay más reservas confirmadas.</p>
        ) : (
          <div className="reservas">
            {loaderData.proximas.map((reserva) => (
              <article key={reserva.id}>
                <div>
                  <h3>
                    <Link to={href('/hospitaleros/reservas/:id', { id: reserva.id })}>{reserva.nombre}</Link>
                  </h3>
                  <p>
                    {reserva.noche} · {reserva.personas} {reserva.personas === 1 ? 'persona' : 'personas'}
                  </p>
                </div>
                <span className={`estado ${reserva.estado}`}>{reserva.estado}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
