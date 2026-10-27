import { isRouteErrorResponse } from 'react-router'

export function informarError(error: unknown, contexto: { url: string; metodo: string }): void {
  const respuesta = isRouteErrorResponse(error) ? error : undefined
  const excepcion = error instanceof Error ? error : undefined
  const linea: Record<string, string | number> = {
    nivel: 'error',
    mensaje: respuesta
      ? `${respuesta.status} ${respuesta.statusText}`.trim()
      : excepcion?.message ?? String(error),
    url: contexto.url,
    metodo: contexto.metodo,
  }
  if (respuesta) {
    linea.status = respuesta.status
    linea.statusText = respuesta.statusText
  }
  // L22: la pila ayuda en desarrollo, pero en producción revelaría internals.
  if (process.env.NODE_ENV !== 'production' && excepcion?.stack) linea.pila = excepcion.stack
  // Aquí se conectaría Sentry u otro servicio de seguimiento de errores.
  console.error(JSON.stringify(linea))
}
