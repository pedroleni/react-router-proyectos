import { Form, href, redirect } from 'react-router'
import { cerrarSesion, leerSesion } from '~/sesiones.server'
import type { Route } from './+types/salir'

export async function action({ request }: Route.ActionArgs) {
  const sesion = await leerSesion(request)
  return redirect(href('/'), { headers: { 'Set-Cookie': await cerrarSesion(sesion) } })
}

export default function Salir() {
  return (
    <main className="pagina estrecha acceso">
      <title>Cerrar sesión | Hospitaleros de El Cea</title>
      <h1>Cerrar sesión</h1>
      <p>Confirma que quieres terminar el turno en este navegador.</p>
      {/* L18/L20: el componente convierte /salir en ruta de interfaz; React Router
          comprueba el origen de su POST, algo que no hace con rutas de recurso. */}
      <Form method="post">
        <button type="submit">Cerrar sesión</button>
      </Form>
    </main>
  )
}
