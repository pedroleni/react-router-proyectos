import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Marco from './componentes/Marco'
import RutaProtegida from './componentes/RutaProtegida'
import Catalogo from './paginas/Catalogo'
import Entrar from './paginas/Entrar'
import FichaLibro from './paginas/FichaLibro'
import NoEncontrada from './paginas/NoEncontrada'
import NuevoPrestamo from './paginas/NuevoPrestamo'
import Prestamos from './paginas/Prestamos'
import { SesionProvider } from './sesion'

// TODO (paso 1): la última 6, sus future flags y, después, la 7.
// TODO (paso 2): los import de 'react-router-dom' pasan a 'react-router'.
// TODO (paso 3.1): createBrowserRouter y RouterProvider, con estas rutas dentro de una ruta comodín.
export function App() {
  return (
    <SesionProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Marco />}>
            <Route index element={<Navigate to="/catalogo" replace />} />
            <Route path="catalogo" element={<Catalogo />} />
            <Route path="catalogo/:id" element={<FichaLibro />} />
            <Route path="entrar" element={<Entrar />} />
            <Route element={<RutaProtegida />}>
              <Route path="prestamos" element={<Prestamos />} />
              <Route path="prestamos/nuevo" element={<NuevoPrestamo />} />
            </Route>
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SesionProvider>
  )
}

// La entrada de la app: main.tsx la llama con el div#root y los tests, con su
// propio contenedor. Devuelve cómo desmontarla. Es lo único que los tests
// conocen de la app, y no cambia en toda la migración.
export function iniciarApp(contenedor: HTMLElement) {
  const raiz = createRoot(contenedor)
  raiz.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  return () => raiz.unmount()
}
