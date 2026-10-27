import { href, Link } from 'react-router'
import { leerAviso } from '~/datos/avisos.server'
import type { Route } from './+types/portada'

export async function loader() {
  return { aviso: await leerAviso() }
}

export default function Portada({ loaderData }: Route.ComponentProps) {
  return (
    <main>
      <title>Albergue El Cea | Descanso en Sahagún</title>
      <meta
        name="description"
        content="Albergue de peregrinos en Sahagún, con 24 camas y reserva por noche."
      />
      {loaderData.aviso && (
        <aside className="aviso-publico" aria-live="polite">
          <strong>Aviso del Ayuntamiento:</strong> {loaderData.aviso.texto}
        </aside>
      )}
      <section className="portada">
        <div className="portada-texto">
          <p className="sobrelinea">Sahagún, kilómetro 376</p>
          <h1>Una cama limpia. Un alto en el Camino.</h1>
          <p>
            Veinticuatro plazas para descansar, lavar la ropa y compartir mesa antes de seguir hacia León.
          </p>
          <div className="acciones">
            <Link className="boton" to={href('/reservar')}>
              Reservar cama
            </Link>
            <Link className="boton secundario" to={href('/albergue')}>
              Conocer el albergue
            </Link>
          </div>
        </div>
        <div className="portada-patio" aria-label="Patio tranquilo del albergue">
          <span className="arco" />
          <p>
            Abierto
            <br />
            <strong>marzo-octubre</strong>
          </p>
        </div>
      </section>
      <section className="datos-clave" aria-label="Datos principales">
        <div>
          <strong>24</strong>
          <span>camas</span>
        </div>
        <div>
          <strong>3</strong>
          <span>habitaciones</span>
        </div>
        <div>
          <strong>12 €</strong>
          <span>por noche</span>
        </div>
        <div>
          <strong>15 €</strong>
          <span>con desayuno</span>
        </div>
      </section>
    </main>
  )
}
