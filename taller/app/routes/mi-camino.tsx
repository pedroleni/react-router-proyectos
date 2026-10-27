import type { Route } from './+types/mi-camino'

export async function clientLoader(): Promise<never> {
  // TODO (lección 16): devuelve las etapas guardadas por app/mi-camino.ts.
  throw new Error('TODO (lección 16): clientLoader de Mi camino.')
}

export function HydrateFallback() {
  // TODO (lección 16): explica la espera mientras el navegador lee localStorage.
  return <p>TODO (lección 16): preparando Mi camino.</p>
}

export default function MiCamino(_props: Route.ComponentProps) {
  return <main>TODO (lección 16): Mi camino.</main>
}
