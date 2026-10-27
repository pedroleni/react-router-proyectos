import { Link } from 'react-router-dom'

// TODO (paso 3.7): una ruta más del router de datos, y adiós a la ruta comodín.
export default function NoEncontrada() {
  return (
    <section>
      <h1>Esta página no existe</h1>
      <p>
        <Link to="/catalogo">Ir al catálogo</Link>
      </p>
    </section>
  )
}
