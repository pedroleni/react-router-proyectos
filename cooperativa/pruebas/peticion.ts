import { RouterContextProvider } from 'react-router'
import { sesionContext, socioContext } from '~/contexto.server'
import { exigirSocio } from '~/middleware/socio.server'
import { buscarSocio } from '~/datos/socios.server'
import { leerSesion, type Sesion } from '~/sesiones.server'
import type { Cesta } from '~/tipos'

// Lo necesario para llamar a un loader, una action o un middleware en un
// test, como los llamaría el servidor.

export const ORIGEN = 'http://localhost:5173'
export const PILAR = 'S-0142'
export const JAVIER = 'S-0007'

/**
 * Los argumentos que React Router pasa a un loader, una action o un
 * middleware. request.url es la petición tal cual (con .data si la pidió el
 * navegador al navegar); url, la dirección de la página, sin .data.
 */
export function argumentos<A>(
  ruta: string,
  { init, params = {}, context = new RouterContextProvider() }: { init?: RequestInit; params?: Record<string, string>; context?: RouterContextProvider } = {},
): A {
  const request = new Request(`${ORIGEN}${ruta}`, init)
  const url = new URL(request.url)
  url.pathname = url.pathname.replace(/\.data$/, '')
  return { request, url, params, context, pattern: '' } as unknown as A
}

/**
 * Lo que devolvió un loader o una action, cuando tiene que ser una Response
 * (un redirect, por ejemplo). Si no lo es, el test falla diciendo qué llegó.
 */
export function respuesta(valor: unknown): Response {
  if (valor instanceof Response) return valor
  throw new Error(`Se esperaba una Response y llegó ${JSON.stringify(valor)}`)
}

/** Un formulario enviado con POST, como lo enviaría el navegador. */
export function envio(campos: Record<string, string>, cabeceras: Record<string, string> = {}): RequestInit {
  return { method: 'POST', body: new URLSearchParams(campos), headers: cabeceras }
}

/** De «__sesion=abc.def; Max-Age=…; Path=/», solo «__sesion=abc.def», para la cabecera Cookie. */
export function cookieDe(setCookie: string | null): string {
  if (!setCookie) throw new Error('La respuesta no trae Set-Cookie')
  return setCookie.split(';')[0]
}

/**
 * Un context como el que deja el middleware de la zona: el socio y una sesión
 * (vacía o con la cesta que digas). Devuelve también la sesión, para mirar
 * después qué ha cambiado.
 */
export async function contextoDeSocio(socioId: string, cesta?: Cesta): Promise<{ context: RouterContextProvider; sesion: Sesion }> {
  const socio = buscarSocio(socioId)
  if (!socio) throw new Error(`No existe el socio ${socioId}`)
  const sesion = await leerSesion(new Request(ORIGEN))
  sesion.set('socioId', socio.id)
  if (cesta) sesion.set('cesta', cesta)
  const context = new RouterContextProvider()
  context.set(socioContext, socio)
  context.set(sesionContext, sesion)
  return { context, sesion }
}


/** Un loader o una action de la zona, con los argumentos que recibe. */
type Manejador = (args: never) => unknown

/**
 * Una petición a la zona de socios atendida como en el servidor: el middleware
 * exigirSocio por fuera (lee la cookie, deja al socio en el context y, a la
 * vuelta, escribe Set-Cookie si la sesión cambió) y, dentro, el loader o la
 * action. Devuelve la respuesta, con sus cabeceras, y los datos que devolvió.
 */
export async function atender(ruta: string, init: RequestInit, manejador: Manejador): Promise<{ respuesta: Response; datos: unknown }> {
  let datos: unknown
  const args = argumentos<Parameters<typeof exigirSocio>[0]>(ruta, { init })
  const respuesta = (await exigirSocio(args, async () => {
    try {
      datos = await (manejador as (a: unknown) => Promise<unknown>)(args)
    } catch (lanzado) {
      if (lanzado instanceof Response) return lanzado
      throw lanzado
    }
    if (datos instanceof Response) return datos
    // data(valor, { status }) lleva su estado; lo demás es un 200.
    const conInit = datos as { type?: string; data?: unknown; init?: ResponseInit }
    if (conInit?.type === 'DataWithResponseInit') {
      datos = conInit.data
      return Response.json(conInit.data, conInit.init ?? undefined)
    }
    return Response.json(datos)
  })) as Response
  return { respuesta, datos }
}
