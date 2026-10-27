import { href, isRouteErrorResponse, Link, Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration } from 'react-router'
import type { Route } from './+types/root'
import './app.css'

export const links: Route.LinksFunction = () => [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }]

// El documento entero. Ojo: root no tiene loader ni lee la sesión. La cabecera
// es la misma para todo el mundo, y por eso la portada y «Cómo funciona» se
// pueden generar una vez al construir y el catálogo puede guardarse en una
// caché compartida. Lo que depende del socio vive en la zona de socios.
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <header className="cabecera">
          <Link to={href('/')} className="marca">
            <span className="marca-nombre">La Huerta del Ebro</span>
            <span className="marca-lema">Cooperativa de consumo · Zaragoza</span>
          </Link>
          <nav aria-label="Principal" className="menu">
            <NavLink to={href('/como-funciona')}>Cómo funciona</NavLink>
            <NavLink to={href('/catalogo')}>Catálogo</NavLink>
            <NavLink to={href('/socio')} className="menu-socios">
              Zona de socios
            </NavLink>
          </nav>
        </header>
        {children}
        <footer className="pie">
          <p>Cooperativa La Huerta del Ebro · Verdura y fruta de las huertas del Ebro, cada semana.</p>
        </footer>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

// Un error inesperado en cualquier página (un 500). Las direcciones que no
// existen tienen su propia ruta, no-encontrada.tsx.
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const noExiste = isRouteErrorResponse(error) && error.status === 404
  let detalle: string | undefined
  if (import.meta.env.DEV && error instanceof Error) detalle = error.stack

  return (
    <main className="pagina estrecha">
      <title>{noExiste ? 'Página no encontrada · La Huerta del Ebro' : 'Error · La Huerta del Ebro'}</title>
      <meta name="robots" content="noindex" />
      <h1>{noExiste ? 'Esta página no existe' : 'Algo ha fallado'}</h1>
      <p>
        {noExiste
          ? 'Puede que la dirección esté mal escrita.'
          : 'No hemos podido preparar esta página. Inténtalo de nuevo dentro de un rato.'}
      </p>
      {detalle && <pre className="pila">{detalle}</pre>}
      <p>
        <Link to={href('/')}>Volver al inicio</Link>
      </p>
    </main>
  )
}
