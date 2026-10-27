import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from '../sesion'

// Envuelve las rutas de préstamos: sin sesión, a /entrar?volver=…
// TODO (paso 2): revisa este tipo de retorno cuando pases a los tipos de React 19.
// TODO (paso 3.5): un middleware en la ruta, en vez de este componente.
export default function RutaProtegida(): JSX.Element {
  const { usuario, cargando } = useSesion()
  const ubicacion = useLocation()

  if (cargando) return <p className="cargando">Comprobando la sesión…</p>
  if (!usuario) {
    const volver = encodeURIComponent(ubicacion.pathname + ubicacion.search)
    return <Navigate to={`/entrar?volver=${volver}`} replace />
  }
  return <Outlet />
}
