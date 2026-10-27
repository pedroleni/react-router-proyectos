import { Form } from 'react-router'
import type { Route } from './+types/salir'

export async function action(_args: Route.ActionArgs): Promise<never> {
  // TODO (lección 18): destruye la sesión y redirige al inicio. Busca
  // destroySession y Set-Cookie.
  throw new Error('TODO (lección 18): action de salida.')
}

export default function Salir() {
  // TODO (lección 18): crea la página «Cerrar sesión» con un Form POST. Al ser
  // una ruta de interfaz, React Router podrá comprobar su origen en la lección 20.
  return <main>TODO (lección 18): página para cerrar la sesión.</main>
}
