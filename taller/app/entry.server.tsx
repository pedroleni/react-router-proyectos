import { PassThrough } from 'node:stream'
import { createReadableStreamFromReadable } from '@react-router/node'
import { isbot } from 'isbot'
import type { RenderToPipeableStreamOptions } from 'react-dom/server'
import { renderToPipeableStream } from 'react-dom/server'
import {
  isRouteErrorResponse,
  ServerRouter,
  type EntryContext,
  type HandleErrorFunction,
  type RouterContextProvider,
  type ServerInstrumentation,
} from 'react-router'

// TODO (lección 17): limita a cinco segundos las promesas pendientes de los
// loaders y actions. Busca streamTimeout en la plantilla de entry.server.
export const streamTimeout = 10_000

export function cabecerasDeSeguridad(
  _nonce: string,
  _entorno = process.env.NODE_ENV
): Record<string, string> {
  // TODO (lección 20): crea las cabeceras habituales y la CSP de producción.
  throw new Error('TODO (lección 20): cabeceras de seguridad y CSP.')
}

export const handleError: HandleErrorFunction = (error, { request }) => {
  // Mientras llega la lección 22 se conserva exactamente el comportamiento
  // predeterminado de React Router para no ocultar errores de lecciones previas.
  if (process.env.NODE_ENV !== 'test' && !request.signal.aborted) {
    const errorInterno = isRouteErrorResponse(error) && 'error' in error ? error.error : undefined
    console.error(errorInterno || error)
  }
  // TODO (lección 22): sustituye este registro por informarError.
}

// TODO (lección 22): instrumenta loaders y actions. Busca ServerInstrumentation.
export const instrumentations: ServerInstrumentation[] = []

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: RouterContextProvider
) {
  if (request.method.toUpperCase() === 'HEAD')
    return new Response(null, { status: responseStatusCode, headers: responseHeaders })

  return new Promise<Response>((resolve, reject) => {
    let documentoPreparado = false
    const agente = request.headers.get('user-agent')
    const alEstarListo: keyof RenderToPipeableStreamOptions =
      (agente && isbot(agente)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady'
    let temporizador: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => abort(),
      streamTimeout + 1_000
    )
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} />,
      {
        [alEstarListo]() {
          documentoPreparado = true
          const cuerpo = new PassThrough({
            final(terminar) {
              clearTimeout(temporizador)
              temporizador = undefined
              terminar()
            },
          })
          const flujo = createReadableStreamFromReadable(cuerpo)
          responseHeaders.set('Content-Type', 'text/html')
          pipe(cuerpo)
          resolve(new Response(flujo, { headers: responseHeaders, status: responseStatusCode }))
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          responseStatusCode = 500
          if (documentoPreparado) console.error(error)
        },
      }
    )
  })
}
