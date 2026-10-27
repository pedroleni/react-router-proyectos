import type { MiddlewareFunction } from 'react-router'

/**
 * Protege la zona de socios. Envuelve cada petición a una ruta de /socio, de
 * documento o de datos (.data), por fuera de sus loader y sus action:
 * - sin sesión, manda a /entrar y apunta en ?volver= adónde ibas;
 * - con sesión, deja al socio y su sesión en el context;
 * - a la vuelta, guarda la sesión si algo la ha cambiado y marca la respuesta
 *   como privada: lleva datos de una persona.
 */
export const exigirSocio: MiddlewareFunction<Response> = async ({ request, url, context }, next) => {
  // TODO (paso 2):
  // 1. Lee la sesión de la petición (leerSesion) y busca a su socio
  //    (buscarSocio con el socioId de la sesión).
  // 2. Si no hay socio, lanza un redirect a /entrar?volver=… con la dirección
  //    de la página: url.pathname + url.search. Ojo: url, no request.url, que
  //    al navegar acaba en .data. Monta la búsqueda con URLSearchParams.
  // 3. Si lo hay, deja en el context el socio (socioContext) y la sesión
  //    (sesionContext), y apunta cómo era la sesión: JSON.stringify(sesion.data).
  // 4. Llama a next() para que se ejecuten los loader o la action.
  // 5. A la vuelta, si la sesión ha cambiado, añade a la respuesta la cabecera
  //    Set-Cookie de guardarSesion(sesion) (con append), y pon siempre
  //    Cache-Control: private, no-store. Devuelve la respuesta.
  void request
  void url
  void context
  return next()
}
