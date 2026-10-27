import { Form, Link, NavLink, Outlet, useLoaderData, useRevalidator, type LoaderFunctionArgs } from 'react-router'
import { sesionContext } from '../sesion'

// La ruta raíz: la cabecera, el menú y el pie de todas las páginas.
export async function loader({ context }: LoaderFunctionArgs) {
  return { usuario: await context.get(sesionContext).usuario() }
}

export function Component() {
  const { usuario } = useLoaderData<typeof loader>()

  return (
    <div className="marco">
      <header className="cabecera">
        <Link to="/catalogo" className="marca">
          <span className="marca-sello" aria-hidden="true">TA</span>
          Biblioteca del IES Tierras Altas
        </Link>
        <nav aria-label="Principal" className="menu">
          <NavLink to="/catalogo">Catálogo</NavLink>
          <NavLink to="/prestamos">Préstamos</NavLink>
        </nav>
        <div className="sesion">
          {usuario ? (
            <>
              <span className="usuario">{usuario.nombre}</span>
              <Form method="post" action="/salir">
                <button type="submit" className="boton-secundario">
                  Cerrar sesión
                </button>
              </Form>
            </>
          ) : (
            <Link to="/entrar">Entrar</Link>
          )}
        </div>
      </header>
      <main className="contenido">
        <Outlet />
      </main>
      <footer className="pie">Biblioteca del IES Tierras Altas · Soria · Préstamos de lectura</footer>
    </div>
  )
}

// Lo que se ve mientras se ejecutan los loader de la primera carga.
export function HydrateFallback() {
  return <p className="cargando">Cargando la biblioteca…</p>
}

// Lo inesperado, como que /api/sesion falle: sustituye a toda la página,
// cabecera incluida, porque la raíz no ha podido pintarse. «Reintentar» vuelve
// a ejecutar los loader.
export function ErrorBoundary() {
  const revalidador = useRevalidator()
  return (
    <main className="contenido">
      <h1>Algo ha fallado</h1>
      <p role="alert" className="aviso-error">
        No se ha podido abrir la biblioteca.
      </p>
      <button type="button" onClick={() => revalidador.revalidate()} disabled={revalidador.state === 'loading'}>
        Reintentar
      </button>
    </main>
  )
}
