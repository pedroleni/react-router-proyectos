import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterContextProvider } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { rutas } from './rutas'
import { crearSesion, sesionContext } from './sesion'

// La entrada de la app: main.tsx la llama con el div#root y los tests, con su
// propio contenedor. Devuelve cómo desmontarla. Es lo único que los tests
// conocen de la app, y no cambia en toda la migración.
export function iniciarApp(contenedor: HTMLElement) {
  const sesion = crearSesion()
  const router = createBrowserRouter(rutas, {
    // Cada navegación recibe un contexto nuevo con la misma sesión.
    getContext() {
      const contexto = new RouterContextProvider()
      contexto.set(sesionContext, sesion)
      return contexto
    },
  })
  const raiz = createRoot(contenedor)
  raiz.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
  return () => {
    raiz.unmount()
    router.dispose()
  }
}
