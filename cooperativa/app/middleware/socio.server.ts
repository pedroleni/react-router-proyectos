import { href, redirect, type MiddlewareFunction } from 'react-router'
import { sesionContext, socioContext } from '~/contexto.server'
import { buscarSocio } from '~/datos/socios.server'
import { guardarSesion, leerSesion } from '~/sesiones.server'

/**
 * Protege la zona de socios. Envuelve cada petición a una ruta de /socio, de
 * documento o de datos (.data), por fuera de sus loader y sus action:
 * - sin sesión, manda a /entrar y apunta en ?volver= adónde ibas;
 * - con sesión, deja al socio y su sesión en el context;
 * - a la vuelta, guarda la sesión si algo la ha cambiado y marca la respuesta
 *   como privada: lleva datos de una persona.
 */
export const exigirSocio: MiddlewareFunction<Response> = async ({ request, url, context }, next) => {
  const sesion = await leerSesion(request)
  const socio = buscarSocio(sesion.get('socioId'))

  if (!socio) {
    // url es la dirección de la página; request.url, la petición tal cual,
    // que al navegar acaba en .data.
    const volver = url.pathname + url.search
    throw redirect(`${href('/entrar')}?${new URLSearchParams({ volver })}`)
  }

  context.set(socioContext, socio)
  context.set(sesionContext, sesion)
  const antes = JSON.stringify(sesion.data)

  const respuesta = await next()

  // Los loader y las action solo cambian la sesión; la cookie se manda aquí,
  // una vez y solo si ha cambiado algo.
  if (JSON.stringify(sesion.data) !== antes) {
    respuesta.headers.append('Set-Cookie', await guardarSesion(sesion))
  }
  respuesta.headers.set('Cache-Control', 'private, no-store')
  return respuesta
}
