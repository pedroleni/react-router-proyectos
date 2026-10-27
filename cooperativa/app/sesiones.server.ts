import { type Session, type SessionStorage } from 'react-router'
import type { Cesta } from './tipos'
import { secretosDeSesion } from './config.server'

/** Lo que guarda la sesión entre una petición y otra. */
export type DatosSesion = {
  socioId: string
  cesta: Cesta
}

/** Los mensajes de un solo uso: se borran al leerlos. */
export type DatosFlash = {
  aviso: string
}

export type Sesion = Session<DatosSesion, DatosFlash>

/** El almacén de sesiones: la sesión entera viaja en una cookie firmada. */
export function crearAlmacenDeSesiones(secretos: string[]): SessionStorage<DatosSesion, DatosFlash> {
  // TODO (paso 1): devuelve createCookieSessionStorage<DatosSesion, DatosFlash>()
  // con una cookie que se llame __sesion y que sea:
  // - httpOnly (el JavaScript de la página no puede leerla),
  // - sameSite 'lax' (no viaja en los POST que llegan desde otras webs),
  // - secure solo en producción (process.env.NODE_ENV === 'production'),
  // - de path '/', con dos semanas de vida (maxAge, en segundos),
  // - firmada con los secretos que recibe esta función (secrets).
  void secretos
  throw new Error('Falta el almacén de sesiones (paso 1).')
}

// El almacén se crea con la primera petición, no al importar el módulo: el
// build también importa el servidor (para prerenderizar) y no tiene por qué
// conocer el secreto.
let almacen: SessionStorage<DatosSesion, DatosFlash> | undefined
function almacenDeSesiones() {
  almacen ??= crearAlmacenDeSesiones(secretosDeSesion())
  return almacen
}

/** La sesión de la petición, leída de su cabecera Cookie. Si no hay, o no es válida, una vacía. */
export function leerSesion(request: Request): Promise<Sesion> {
  return almacenDeSesiones().getSession(request.headers.get('Cookie'))
}

/** La cabecera Set-Cookie que guarda la sesión en el navegador. */
export function guardarSesion(sesion: Sesion): Promise<string> {
  return almacenDeSesiones().commitSession(sesion)
}

/** La cabecera Set-Cookie que borra la cookie. */
export function cerrarSesion(sesion: Sesion): Promise<string> {
  return almacenDeSesiones().destroySession(sesion)
}
