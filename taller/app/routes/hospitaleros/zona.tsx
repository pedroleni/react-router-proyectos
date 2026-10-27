import { Form, href, Link, NavLink, Outlet } from 'react-router'
import { hospitaleroContext } from '~/contexto.server'
import { exigirHospitalero } from '~/middleware/hospitalero.server'
import type { Route } from './+types/zona'

export const middleware: Route.MiddlewareFunction[] = [exigirHospitalero]
// L17/L18: el middleware protege todos los hijos y aplica `private, no-store`
// incluso a sus documentos, respuestas .data y rutas de recurso.

export async function loader({ context }: Route.LoaderArgs) {
  return { hospitalero: context.get(hospitaleroContext) }
}

export default function Zona({ loaderData }: Route.ComponentProps) {
  return (
    <div className="zona">
      <header className="zona-cabecera">
        <div>
          <Link className="marca" to={href('/hospitaleros')}>
            <span>El Cea</span>
            <small>Turno de hospitaleros</small>
          </Link>
          <p>
            Hola, <strong>{loaderData.hospitalero.nombre}</strong>
          </p>
        </div>
        <Form method="post" action={href('/salir')}>
          <button className="boton secundario" type="submit">
            Salir
          </button>
        </Form>
      </header>
      <nav aria-label="Zona de hospitaleros" className="zona-menu">
        <NavLink to={href('/hospitaleros')} end>
          Reservas
        </NavLink>
        <Link reloadDocument to={href('/hospitaleros/pernoctas.csv')}>
          {/* L19: reloadDocument descarga la ruta de recurso fuera del router cliente. */}
          Pernoctas (CSV)
        </Link>
      </nav>
      <Outlet />
    </div>
  )
}
