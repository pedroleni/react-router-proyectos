import { RouterContextProvider } from 'react-router'

export const ORIGEN = 'http://localhost:5173'

/** Argumentos equivalentes a los que React Router entrega a cada manejador. */
export function argumentos<A>(
  ruta: string,
  {
    init,
    params = {},
    context = new RouterContextProvider(),
  }: { init?: RequestInit; params?: Record<string, string>; context?: RouterContextProvider } = {},
): A {
  const request = new Request(`${ORIGEN}${ruta}`, init)
  const url = new URL(request.url)
  url.pathname = url.pathname.replace(/\.data$/, '')
  return { request, url, params, context, pattern: '' } as unknown as A
}

export function respuesta(valor: unknown): Response {
  if (valor instanceof Response) return valor
  throw new Error(`Se esperaba una Response y llegó ${JSON.stringify(valor)}`)
}

export function envio(campos: Record<string, string>, cabeceras: Record<string, string> = {}): RequestInit {
  return { method: 'POST', body: new URLSearchParams(campos), headers: cabeceras }
}

export function cookieDe(setCookie: string | null): string {
  if (!setCookie) throw new Error('La respuesta no trae Set-Cookie')
  return setCookie.split(';')[0]
}
