import { Form, href, Link, redirect } from 'react-router'
import type { Route } from './+types/salir'

// Cerrar sesión cambia algo, así que va en una action (un POST), nunca en un
// loader: un enlace o una imagen de otra web podrían cerrar tu sesión con un GET.
export async function action(_: Route.ActionArgs) {
  // TODO (paso 1): así no se cierra nada, la cookie sigue en el navegador.
  // Lee la sesión y redirige con la cabecera Set-Cookie de cerrarSesion(sesion),
  // que la borra.
  return redirect(href('/'))
}

// Con componente, esta es una ruta de interfaz, y React Router comprueba el
// origen de los envíos a su action. Sin él sería una ruta de recursos, y esa
// comprobación no se hace en las rutas de recursos.
export default function Salir() {
  return (
    <main className="pagina estrecha">
      <title>Salir · La Huerta del Ebro</title>
      <h1>¿Quieres salir?</h1>
      <Form method="post">
        <button type="submit">Salir</button>
      </Form>
      <p>
        <Link to={href('/socio')}>No, volver a mi cesta</Link>
      </p>
    </main>
  )
}
