import { href, Link } from 'react-router'
import { ETAPAS } from '~/datos/etapas'
import { leerMiCamino } from '~/mi-camino'
import type { Route } from './+types/mi-camino'

export async function clientLoader() {
  const guardadas = new Set(leerMiCamino())
  return { etapas: ETAPAS.filter((etapa) => guardadas.has(etapa.slug)) }
}

// L16: aquí sí hace falta el fallback: esta ruta solo tiene clientLoader porque
// el servidor no puede leer el localStorage del navegador del peregrino.
export function HydrateFallback() {
  return (
    <main className="pagina estrecha">
      <p className="cargando">Preparando tu camino…</p>
    </main>
  )
}

export default function MiCamino({ loaderData }: Route.ComponentProps) {
  return (
    <main className="pagina estrecha">
      <title>Mi camino | El Cea</title>
      <h1>Mi camino</h1>
      {loaderData.etapas.length === 0 ? (
        <p>Aún no has añadido ninguna etapa desde su ficha.</p>
      ) : (
        <ul className="lista-etapas">
          {loaderData.etapas.map((etapa) => (
            <li key={etapa.slug}>
              <Link to={href('/etapas/:etapa', { etapa: etapa.slug })}>
                {etapa.origen} hasta {etapa.destino}
              </Link>
              <span>{String(etapa.kilometros).replace('.', ',')} km</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
