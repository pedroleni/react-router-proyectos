import { ETAPAS } from '~/datos/etapas'

export function loader() {
  return Response.json(ETAPAS, {
    headers: {
      // L19: son datos públicos sin cookies ni información personal, por eso `*` es seguro.
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
