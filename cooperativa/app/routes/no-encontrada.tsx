import { data, href, Link } from 'react-router'

// Cualquier dirección que no es de ninguna otra ruta. El loader pone el 404:
// el texto de la página no basta para que un buscador sepa que no existe.
export function loader() {
  return data(null, { status: 404 })
}

export default function NoEncontrada() {
  return (
    <main className="pagina estrecha">
      <title>Página no encontrada · La Huerta del Ebro</title>
      <meta name="robots" content="noindex" />
      <h1>Esta página no existe</h1>
      <p>Puede que la dirección esté mal escrita.</p>
      <p>
        <Link to={href('/')}>Volver al inicio</Link>
      </p>
    </main>
  )
}
