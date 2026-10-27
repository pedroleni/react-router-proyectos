import type { Route } from './+types/reserva'

export async function loader(_args: Route.LoaderArgs): Promise<never> {
  throw new Error('TODO (lección 18): carga la reserva protegida.')
}

export async function action(_args: Route.ActionArgs): Promise<never> {
  // TODO (lección 18): marca la llegada y deja un flash breve.
  // TODO (lección 19): añade la subida multipart de la credencial.
  throw new Error('TODO (lección 18): action de la reserva protegida.')
}

export default function Reserva(_props: Route.ComponentProps) {
  return <main>TODO (lección 18): detalle de la reserva.</main>
}
