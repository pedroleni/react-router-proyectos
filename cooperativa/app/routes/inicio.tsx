import { href, Link } from 'react-router'

// La portada. Se prerenderiza al construir (react-router.config.ts): no tiene
// loader ni nada que dependa de quién la pide.
export default function Inicio() {
  return (
    <main className="pagina">
      <title>La Huerta del Ebro · Cooperativa de consumo en Zaragoza</title>
      <meta
        name="description"
        content="Cestas semanales de verdura, fruta, huevos y pan de las huertas del Ebro. Pide hasta el miércoles y recoge el jueves o el viernes en tu barrio."
      />
      <section className="portada">
        <p className="antetitulo">Cooperativa de consumo · Zaragoza</p>
        <h1>La cesta de la semana, de la huerta a tu barrio</h1>
        <p className="entradilla">
          Somos 214 familias que compramos juntas a hortelanos de Movera, Juslibol, Montañana y el resto de la vega del
          Ebro. Cada semana eliges qué llevas en tu cesta y la recoges en tu barrio.
        </p>
        <p className="acciones">
          <Link to={href('/catalogo')} className="boton">
            Ver el catálogo de esta semana
          </Link>
          <Link to={href('/socio')} className="boton secundario">
            Hacer mi pedido
          </Link>
        </p>
      </section>

      <section aria-labelledby="pasos" className="pasos">
        <h2 id="pasos">Así funciona una semana</h2>
        <ol>
          <li>
            <strong>Lunes:</strong> la comisión de compras publica el catálogo con lo que hay en la huerta.
          </li>
          <li>
            <strong>Hasta el miércoles a las 20:00:</strong> llenas tu cesta y confirmas el pedido.
          </li>
          <li>
            <strong>Jueves o viernes:</strong> la recoges en el Casco Histórico, el Actur o Torrero.
          </li>
        </ol>
        <p>
          <Link to={href('/como-funciona')}>Todo sobre la cooperativa y cómo hacerte socio</Link>
        </p>
      </section>
    </main>
  )
}
