import { createCookieSessionStorage, type Session, type SessionStorage } from 'react-router'
import { secretosDeSesion } from '~/config.server'

export type DatosSesion = { hospitaleroId: string; inicio: number }
export type DatosFlash = { aviso: string }
export type Sesion = Session<DatosSesion, DatosFlash>

export function crearAlmacenDeSesiones(secretos: string[]): SessionStorage<DatosSesion, DatosFlash> {
  return createCookieSessionStorage<DatosSesion, DatosFlash>({
    cookie: {
      // L18: nombre propio, inaccesible a JS, solo mismo sitio, solo HTTPS en
      // producción, válida en toda la app y limitada a ocho horas.
      name: '__sesion',
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
      secrets: secretos,
    },
  })
}

let almacen: SessionStorage<DatosSesion, DatosFlash> | undefined
function almacenDeSesiones() {
  // L18: se crea en la primera petición para leer entonces el entorno y permitir
  // que los tests configuren secretos antes de usarlo.
  almacen ??= crearAlmacenDeSesiones(secretosDeSesion())
  return almacen
}

export function leerSesion(request: Request): Promise<Sesion> {
  return almacenDeSesiones().getSession(request.headers.get('Cookie'))
}

export function guardarSesion(sesion: Sesion): Promise<string> {
  return almacenDeSesiones().commitSession(sesion)
}

export function cerrarSesion(sesion: Sesion): Promise<string> {
  // L18: una cookie de sesión no se revoca en el servidor; salir solo ordena a
  // este navegador borrarla. Para revocación real haría falta un almacén servidor.
  return almacenDeSesiones().destroySession(sesion)
}
