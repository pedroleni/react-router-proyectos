import { data, href, Link } from 'react-router'

export function loader() {
  // L14: data(null, { status: 404 }) conserva la pantalla y da un 404 HTTP real.
  return data(null, { status: 404 })
}

export default function NoEncontrada() {
  return (
    <main className="pagina estrecha">
      <title>Página no encontrada | El Cea</title>
      <meta name="robots" content="noindex" />
      <h1>Esta página no existe</h1>
      <p>Quizá el enlace esté incompleto o haya cambiado.</p>
      <Link className="boton" to={href('/')}>
        Volver al inicio
      </Link>
    </main>
  )
}
