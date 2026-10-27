import { Outlet } from 'react-router'
import type { Route } from './+types/root'
import './app.css'

// TODO (lección 16): instala aquí el middleware que mide todas las navegaciones.
export const clientMiddleware: Route.ClientMiddlewareFunction[] = []

export function Layout({ children }: { children: React.ReactNode }) {
  // TODO (lección 14): construye el documento HTML español e incluye Meta,
  // Links, ScrollRestoration y Scripts. Busca root route y Layout export.
  return <>{children}</>
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary(_props: Route.ErrorBoundaryProps) {
  // TODO (lección 14): distingue respuestas 404 y errores inesperados sin
  // enseñar detalles internos en producción. Busca Route ErrorBoundary.
  return <main>TODO (lección 14): frontera de error general.</main>
}
