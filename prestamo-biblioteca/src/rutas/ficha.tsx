import { data, isRouteErrorResponse, Link, useLoaderData, useRouteError, type LoaderFunctionArgs } from 'react-router'
import { ErrorApi, pedirJson } from '../api'
import { fechaLarga } from '../formato'
import type { Ejemplar, Libro } from '../tipos'

// El libro y sus ejemplares, a la vez: las dos peticiones solo necesitan el id
// de la URL, así que no hay por qué esperar a una para lanzar la otra.
export async function loader({ params, request }: LoaderFunctionArgs) {
  const opciones = { signal: request.signal }
  const [libro, ejemplares] = await Promise.all([
    pedirJson<Libro>(`/api/libros/${params.id}`, opciones).catch((error: unknown) => {
      // Un 404 de la API es un 404 de la página: lo pinta el ErrorBoundary.
      if (error instanceof ErrorApi && error.estado === 404) throw data('Ese libro no existe', { status: 404 })
      throw error
    }),
    // Si fallan solo los ejemplares, la ficha se pinta igual, con su aviso:
    // es lo que hacía la versión 6, y lo que comprueba un test.
    pedirJson<Ejemplar[]>(`/api/libros/${params.id}/ejemplares`, opciones).catch(() => null),
  ])
  return { libro, ejemplares }
}

export function Component() {
  const { libro, ejemplares } = useLoaderData<typeof loader>()

  return (
    <article className="ficha">
      <p className="migas">
        <Link to="/catalogo">Volver al catálogo</Link>
      </p>
      <h1>{libro.titulo}</h1>
      <p className="ficha-autor">{libro.autor}</p>
      <dl className="ficha-datos">
        <dt>Estantería</dt>
        <dd>{libro.estanteria}</dd>
        <dt>Disponibles</dt>
        <dd>
          {libro.disponibles} de {libro.ejemplares} ejemplares
        </dd>
      </dl>
      <h2>Ejemplares</h2>
      {ejemplares === null ? (
        <p role="alert" className="aviso-error">
          No se han podido cargar los ejemplares.
        </p>
      ) : (
        <ul className="ejemplares">
          {ejemplares.map((ejemplar) => (
            <li key={ejemplar.codigo} className={ejemplar.prestadoHasta ? 'prestado' : 'libre'}>
              <span className="codigo">{ejemplar.codigo}</span>
              {ejemplar.prestadoHasta ? `prestado hasta el ${fechaLarga(ejemplar.prestadoHasta)}` : 'disponible'}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <section>
        <h1>No hemos encontrado ese libro</h1>
        <p>
          <Link to="/catalogo">Volver al catálogo</Link>
        </p>
      </section>
    )
  }
  return (
    <p role="alert" className="aviso-error">
      No se ha podido cargar el libro.
    </p>
  )
}
