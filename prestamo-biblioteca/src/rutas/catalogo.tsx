import { Form, Link, redirect, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { pedirJson } from '../api'
import type { Libro } from '../tipos'

// Los datos llegan antes de pintar: sin efecto, sin estado y sin «Cargando…».
// Si cambias de búsqueda deprisa, el router cancela la petición vieja (signal).
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const enLaUrl = url.searchParams.get('q')
  const q = (enLaUrl ?? '').trim()
  // El formulario GET manda el campo tal cual («?q=++delibes+», o «?q=» si
  // está vacío). La 6 lo recortaba en su onSubmit; aquí se recorta y se
  // redirige a la dirección limpia, la misma que dejaba la 6.
  if (enLaUrl !== null && (enLaUrl !== q || q === '')) {
    throw redirect(q ? `/catalogo?q=${encodeURIComponent(q)}` : '/catalogo')
  }
  const libros = await pedirJson<Libro[]>(`/api/libros?q=${encodeURIComponent(q)}`, { signal: request.signal })
  return { q, libros }
}

export function Component() {
  const { q, libros } = useLoaderData<typeof loader>()

  return (
    <section>
      <h1>Catálogo</h1>
      <Buscador q={q} />
      {libros.length === 0 ? (
        <p>No hay libros que coincidan con «{q}».</p>
      ) : (
        <ul className="libros">
          {libros.map((libro) => (
            <li key={libro.id} className="libro">
              <Link to={`/catalogo/${libro.id}`} className="libro-titulo">
                {libro.titulo}
              </Link>
              <span className="libro-autor">{libro.autor}</span>
              <span className={libro.disponibles > 0 ? 'disponibles' : 'disponibles agotado'}>
                {libro.disponibles} de {libro.ejemplares} disponibles
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// Un formulario GET de toda la vida: el navegador (y el router) ponen ?q=… en la URL.
function Buscador({ q }: { q: string }) {
  return (
    <Form method="get" role="search" className="busqueda">
      <label htmlFor="q">Título o autor</label>
      <input id="q" name="q" type="search" defaultValue={q} key={q} />
      <button type="submit">Buscar</button>
    </Form>
  )
}

// Si el loader falla, el router pinta esto en lugar del Component, dentro de la raíz.
export function ErrorBoundary() {
  return (
    <section>
      <h1>Catálogo</h1>
      <p role="alert" className="aviso-error">
        No se ha podido cargar el catálogo.
      </p>
    </section>
  )
}
