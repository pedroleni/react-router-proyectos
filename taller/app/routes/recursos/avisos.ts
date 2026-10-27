import type { Route } from './+types/avisos'

// TODO (lección 19): allowedActionOrigins no autentica un sistema externo;
// valida aquí un Bearer token con comparación constante.
export function loader(): Response {
  throw new Error('TODO (lección 19): rechazar GET y anunciar POST.')
}

export async function action(_args: Route.ActionArgs): Promise<Response> {
  throw new Error('TODO (lección 19): validar y guardar el aviso del webhook.')
}
