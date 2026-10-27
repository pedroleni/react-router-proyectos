import type { Route } from './+types/hoy'
import type { Hospitalero, Reserva } from '~/tipos'

export async function loader(_args: Route.LoaderArgs): Promise<{
  noche: string
  hospitalero: Hospitalero
  reservas: Reserva[]
  proximas: Reserva[]
  aviso: string | null
}> {
  // TODO (lección 18): usa los contextos y devuelve las reservas de hoy en Sahagún.
  throw new Error('TODO (lección 18): loader del turno de hoy.')
}

export default function Hoy(_props: Route.ComponentProps) {
  return <main>TODO (lección 18): reservas del turno.</main>
}
