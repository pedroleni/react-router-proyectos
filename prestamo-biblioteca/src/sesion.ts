import { createContext, redirect, type MiddlewareFunction } from 'react-router'
import { pedirJson } from './api'
import type { Usuario } from './tipos'

// Quién ha entrado. Se pide una vez por arranque de la app y la comparten
// todas las navegaciones, como hacía el SesionProvider de la versión 6.
// Entrar y salir la olvidan, y la siguiente lectura vuelve a pedirla. Si la
// API falla, no se guarda nada: el error sube y la próxima lectura reintenta.
export function crearSesion() {
  let pendiente: Promise<Usuario | null> | null = null
  return {
    usuario() {
      pendiente ??= pedirJson<{ usuario: Usuario | null }>('/api/sesion')
        .then((datos) => datos.usuario)
        .catch((error: unknown) => {
          // Un 500 o un fallo de red no es «sin sesión»: no lo guardes.
          pendiente = null
          throw error
        })
      return pendiente
    },
    olvidar() {
      pendiente = null
    },
  }
}

export type Sesion = ReturnType<typeof crearSesion>

// La sesión llega a los loader, las action y el middleware por el contexto del
// router: iniciarApp la pone con getContext.
export const sesionContext = createContext<Sesion>()

// El middleware de las rutas de préstamos: lo que hacía RutaProtegida, pero
// antes de ejecutar ningún loader ni ninguna action de esas rutas.
export const exigirSesion: MiddlewareFunction = async ({ request, context }) => {
  const usuario = await context.get(sesionContext).usuario()
  if (!usuario) {
    const url = new URL(request.url)
    throw redirect(`/entrar?volver=${encodeURIComponent(url.pathname + url.search)}`)
  }
}
