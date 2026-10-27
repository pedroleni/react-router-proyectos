import { href, redirect, type MiddlewareFunction } from 'react-router'
import { hospitaleroContext, sesionContext } from '~/contexto.server'
import { buscarHospitalero } from '~/datos/hospitaleros.server'
import { destinoSeguro } from '~/seguridad'
import { cerrarSesion, guardarSesion, leerSesion } from '~/sesiones.server'

const OCHO_HORAS = 8 * 60 * 60 * 1000

export const exigirHospitalero: MiddlewareFunction<Response> = async ({ request, url, context }, next) => {
  const sesion = await leerSesion(request)
  const hospitalero = buscarHospitalero(sesion.get('hospitaleroId'))
  const inicio = sesion.get('inicio')
  const caducada = typeof inicio !== 'number' || Date.now() - inicio > OCHO_HORAS
  if (!hospitalero || caducada) {
    // L18/L20: volver conserva el destino interno; throw redirect corta toda la
    // rama protegida antes de que un loader llegue a ejecutarse.
    const volver = destinoSeguro(url.pathname + url.search, href('/hospitaleros'))
    const llegoCookieDeSesion = request.headers
      .get('Cookie')
      ?.split(';')
      .some((cookie) => cookie.trimStart().startsWith('__sesion='))
    throw redirect(`${href('/entrar')}?${new URLSearchParams({ volver })}`, {
      headers: caducada && llegoCookieDeSesion ? { 'Set-Cookie': await cerrarSesion(sesion) } : undefined,
    })
  }
  context.set(hospitaleroContext, hospitalero)
  context.set(sesionContext, sesion)
  // L18: se compara data completa porque leer un flash lo consume después de next().
  const antes = JSON.stringify(sesion.data)
  const respuesta = await next()
  if (JSON.stringify(sesion.data) !== antes)
    respuesta.headers.append('Set-Cookie', await guardarSesion(sesion))
  // L18: el middleware cubre documentos, peticiones .data y el CSV de toda la zona.
  respuesta.headers.set('Cache-Control', 'private, no-store')
  return respuesta
}
