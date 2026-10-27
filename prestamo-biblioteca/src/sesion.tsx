import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { enviarJson, ErrorApi, pedirJson } from './api'
import type { Usuario } from './tipos'

type ValorSesion = {
  usuario: Usuario | null
  cargando: boolean
  entrar: (usuario: string, clave: string) => Promise<boolean>
  salir: () => Promise<void>
}

const SesionContext = createContext<ValorSesion | null>(null)
SesionContext.displayName = 'Sesion'

// TODO (paso 3.2): la sesión pasa al loader de la ruta raíz, y este archivo desaparece.
export function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

  // Quién ha entrado, una sola vez al arrancar la app.
  useEffect(() => {
    let ignorar = false
    pedirJson<{ usuario: Usuario | null }>('/api/sesion')
      .then((datos) => {
        if (!ignorar) setUsuario(datos.usuario)
      })
      .catch(() => {
        if (!ignorar) setUsuario(null)
      })
      .finally(() => {
        if (!ignorar) setCargando(false)
      })
    return () => {
      ignorar = true
    }
  }, [])

  async function entrar(nombreUsuario: string, clave: string) {
    const respuesta = await enviarJson('/api/sesion', 'POST', { usuario: nombreUsuario, clave })
    if (respuesta.status === 401) return false
    if (!respuesta.ok) throw new ErrorApi(respuesta.status)
    const datos = (await respuesta.json()) as { usuario: Usuario }
    setUsuario(datos.usuario)
    return true
  }

  async function salir() {
    const respuesta = await enviarJson('/api/sesion', 'DELETE')
    // Si la API no ha cerrado la sesión, no se hace como que sí.
    if (!respuesta.ok) throw new ErrorApi(respuesta.status)
    setUsuario(null)
  }

  return (
    <SesionContext.Provider value={{ usuario, cargando, entrar, salir }}>{children}</SesionContext.Provider>
  )
}

export function useSesion() {
  const valor = useContext(SesionContext)
  if (!valor) throw new Error('useSesion necesita un <SesionProvider> por encima')
  return valor
}
