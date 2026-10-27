import { href, Link } from 'react-router'
import { ETAPAS } from '~/datos/etapas'

export default function Etapas() {
  return (
    <main className="pagina">
      <title>Etapas cerca de Sahagún | El Cea</title>
      <header className="cabecera-pagina">
        <h1>Etapas del Camino Francés</h1>
        <p>Las distancias son aproximadas. Comprueba siempre el trazado y los servicios antes de salir.</p>
      </header>
      <div className="lista-etapas">
        {ETAPAS.map((etapa) => (
          <article key={etapa.slug}>
            <div>
              <h2>
                <Link to={href('/etapas/:etapa', { etapa: etapa.slug })}>
                  {etapa.origen} <span>hasta</span> {etapa.destino}
                </Link>
              </h2>
              <p>{etapa.descripcion}</p>
            </div>
            <strong>{String(etapa.kilometros).replace('.', ',')} km</strong>
          </article>
        ))}
      </div>
    </main>
  )
}
