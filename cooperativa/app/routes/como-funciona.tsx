import { href, Link } from 'react-router'
import { DIAS, PUNTOS } from '~/reparto'

// Una página fija: se prerenderiza al construir, como la portada.
export default function ComoFunciona() {
  return (
    <main className="pagina estrecha">
      <title>Cómo funciona · La Huerta del Ebro</title>
      <meta
        name="description"
        content="Cómo se hace socio de la cooperativa La Huerta del Ebro, cuándo se pide y dónde se recogen las cestas."
      />
      <h1>Cómo funciona la cooperativa</h1>

      <h2>Hacerte socio</h2>
      <p>
        La cuota es de 30 € al año por familia y se paga en el local del Casco Histórico. Con ella tienes tu número de
        socio y acceso a la zona de socios, donde haces los pedidos.
      </p>

      <h2>Cada semana</h2>
      <p>
        El lunes se publica el catálogo con lo que hay en la huerta y sus precios. Hasta el miércoles a las 20:00
        puedes llenar tu cesta y confirmar el pedido. El pedido mínimo es de 10 €: la furgoneta reparte por barrios y
        no puede hacer viajes para una docena de huevos.
      </p>

      <h2>Dónde y cuándo se recoge</h2>
      <ul>
        {Object.entries(PUNTOS).map(([id, nombre]) => (
          <li key={id}>{nombre}</li>
        ))}
      </ul>
      <p>
        Puedes recogerla el {DIAS.jueves} o el {DIAS.viernes}.
      </p>

      <p>
        <Link to={href('/catalogo')}>Ver el catálogo de esta semana</Link>
      </p>
    </main>
  )
}
