import type { Route } from './+types/entrar'

export async function loader(_args: Route.LoaderArgs): Promise<never> {
  // TODO (lección 18): si ya hay sesión, vuelve al destino solicitado.
  throw new Error('TODO (lección 18): loader de entrada.')
}

export async function action(_args: Route.ActionArgs): Promise<never> {
  // TODO (lección 18): valida credenciales, crea la sesión y redirige sin
  // revelar si falló el usuario o la contraseña. Busca sessions and cookies.
  throw new Error('TODO (lección 18): action de entrada.')
}

export default function Entrar(_props: Route.ComponentProps) {
  return <main>TODO (lección 18): formulario de entrada.</main>
}
