import {
  href,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router'
import type { Route } from './+types/root'
import { clientMiddleware as medirNavegacion } from '~/medir.client'
import './app.css'

// L16: vive en root para medir todas las navegaciones, no solo una rama.
export const clientMiddleware: Route.ClientMiddlewareFunction[] = [medirNavegacion]

export function Layout({ children }: { children: React.ReactNode }) {
  // L14: Layout envuelve también ErrorBoundary y cualquier HydrateFallback.
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const noExiste = isRouteErrorResponse(error) && error.status === 404
  // L14: la pila ayuda en desarrollo, pero no revela internals en producción.
  const detalle = import.meta.env.DEV && error instanceof Error ? error.stack : undefined
  return (
    <main className="pagina estrecha">
      <title>{noExiste ? 'Página no encontrada | Albergue El Cea' : 'Error | Albergue El Cea'}</title>
      <meta name="robots" content="noindex" />
      <h1>{noExiste ? 'Esta página no existe' : 'Algo ha fallado'}</h1>
      <p>
        {noExiste
          ? 'Comprueba la dirección o vuelve al inicio.'
          : 'No hemos podido preparar esta página. Inténtalo de nuevo dentro de un rato.'}
      </p>
      {detalle && <pre className="pila">{detalle}</pre>}
      <Link className="boton" to={href('/')}>
        Volver al inicio
      </Link>
    </main>
  )
}
