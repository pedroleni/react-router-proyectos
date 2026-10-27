import type { Session, SessionStorage } from 'react-router'

export type DatosSesion = { hospitaleroId: string; inicio: number }
export type DatosFlash = { aviso: string }
export type Sesion = Session<DatosSesion, DatosFlash>

function pendiente(): never {
  // TODO (lección 18): crea de forma diferida el almacén de cookies, con ocho
  // horas de vida y sus atributos seguros. Busca createCookieSessionStorage.
  throw new Error('TODO (lección 18): almacén de sesiones.')
}

export function crearAlmacenDeSesiones(_secretos: string[]): SessionStorage<DatosSesion, DatosFlash> {
  return pendiente()
}

export async function leerSesion(_request: Request): Promise<Sesion> {
  return pendiente()
}

export async function guardarSesion(_sesion: Sesion): Promise<string> {
  return pendiente()
}

export async function cerrarSesion(_sesion: Sesion): Promise<string> {
  return pendiente()
}
