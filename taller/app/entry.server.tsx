import { randomBytes } from 'node:crypto'
import { PassThrough } from 'node:stream'
import { createReadableStreamFromReadable } from '@react-router/node'
import { isbot } from 'isbot'
import type { RenderToPipeableStreamOptions } from 'react-dom/server'
import { renderToPipeableStream } from 'react-dom/server'
import {
  ServerRouter,
  type EntryContext,
  type HandleErrorFunction,
  type RouterContextProvider,
  type ServerInstrumentation,
} from 'react-router'
import { informarError } from '~/errores.server'

export const streamTimeout = 5_000
// L17: el router rechaza a los cinco segundos las promesas pendientes de
// loaders y actions; el aborto de React espera 1.000 ms para vaciar esos rechazos.

export function cabecerasDeSeguridad(nonce: string, entorno = process.env.NODE_ENV): Record<string, string> {
  const cabeceras: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  }
  // Vite necesita scripts adicionales y ws: para HMR; la política estricta
  // se aplica al build de producción, que no necesita esas excepciones.
  if (entorno === 'production') {
    cabeceras['Content-Security-Policy'] =
      `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self'; ` +
      `img-src 'self' data:; object-src 'none'; base-uri 'none'; ` +
      `frame-ancestors 'none'; form-action 'self'`
  }
  return cabeceras
}

export const handleError: HandleErrorFunction = (error, { request }) => {
  // L22: un navegador que ya cortó la conexión no representa un fallo del servidor.
  if (request.signal.aborted) return
  informarError(error, { url: request.url, metodo: request.method })
}

// La instrumentación de ruta de 8.5.0 no expone las cabeceras de respuesta.
// Por eso registra los tiempos; no puede añadir Server-Timing con esta API.
export const instrumentations: ServerInstrumentation[] = [
  {
    handler({ instrument }) {
      instrument({
        async request(ejecutar, { request }) {
          const inicio = performance.now()
          const { statusCode, error } = await ejecutar()
          console.info(
            JSON.stringify({
              tipo: 'peticion',
              metodo: request.method,
              url: request.url,
              duracionMs: Math.round(performance.now() - inicio),
              status: statusCode,
              error: error?.message,
            }),
          )
        },
      })
    },
    route({ id, instrument }) {
      instrument({
        async loader(ejecutar, { request }) {
          const inicio = performance.now()
          const { status, error } = await ejecutar()
          console.info(
            JSON.stringify({
              tipo: 'loader',
              ruta: id,
              metodo: request.method,
              url: request.url,
              duracionMs: Math.round(performance.now() - inicio),
              resultado: status,
              error: error?.message,
            }),
          )
        },
        async action(ejecutar, { request }) {
          const inicio = performance.now()
          const { status, error } = await ejecutar()
          console.info(
            JSON.stringify({
              tipo: 'action',
              ruta: id,
              metodo: request.method,
              url: request.url,
              duracionMs: Math.round(performance.now() - inicio),
              resultado: status,
              error: error?.message,
            }),
          )
        },
      })
    },
  },
]

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  _loadContext: RouterContextProvider,
) {
  // L20: un nonce nuevo por petición se pasa tanto al router como al stream de React.
  const nonce = randomBytes(16).toString('base64')
  for (const [nombre, valor] of Object.entries(cabecerasDeSeguridad(nonce)))
    responseHeaders.set(nombre, valor)

  if (request.method.toUpperCase() === 'HEAD')
    return new Response(null, { status: responseStatusCode, headers: responseHeaders })

  return new Promise<Response>((resolve, reject) => {
    let documentoPreparado = false
    const agente = request.headers.get('user-agent')
    // L17: los bots esperan onAllReady para recibir el documento completo; los
    // navegadores pueden empezar con onShellReady y aprovechar el streaming.
    const alEstarListo: keyof RenderToPipeableStreamOptions =
      (agente && isbot(agente)) || routerContext.isSpaMode ? 'onAllReady' : 'onShellReady'
    let temporizador: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => abort(),
      streamTimeout + 1_000,
    )
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={routerContext} url={request.url} nonce={nonce} />,
      {
        nonce,
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
      },
    )
  })
}
