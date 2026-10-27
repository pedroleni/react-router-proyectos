import { Outlet } from 'react-router'
import type { Route } from './+types/zona'

// TODO (lección 18): protege el layout para cubrir también todos sus hijos.
export const middleware: Route.MiddlewareFunction[] = []

export async function loader(_args: Route.LoaderArgs): Promise<never> {
  throw new Error('TODO (lección 18): hospitalero del contexto.')
}

// TODO (lección 18): añade la cabecera con el nombre del hospitalero, «Salir»
// y la navegación de la zona.
// TODO (lección 19): el enlace al CSV debe usar reloadDocument para descargar
// la ruta de recurso fuera del router cliente.
export default function Zona(_props: Route.ComponentProps) {
  return <Outlet />
}
