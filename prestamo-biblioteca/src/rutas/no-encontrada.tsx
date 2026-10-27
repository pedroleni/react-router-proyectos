import { Link } from 'react-router'

export function Component() {
  return (
    <section>
      <h1>Esta página no existe</h1>
      <p>
        <Link to="/catalogo">Ir al catálogo</Link>
      </p>
    </section>
  )
}
