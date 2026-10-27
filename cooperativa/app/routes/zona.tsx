import { Form, href, Link, NavLink, Outlet } from 'react-router'
import ResumenCesta from '~/componentes/ResumenCesta'
import { sesionContext, socioContext } from '~/contexto.server'
import { productosDeLaSemana } from '~/datos/catalogo.server'
import type { Route } from './+types/zona'

// Todas las rutas de /socio pasan por aquí: el middleware las protege a todas,
// también a las que no tienen loader y a la ruta de recursos del CSV.
// TODO (paso 2): pon aquí exigirSocio, de ~/middleware/socio.server. Hasta
// entonces, nadie deja al socio en el context y el loader de abajo falla con
// «No value found for context».
export const middleware: Route.MiddlewareFunction[] = []

// El loader hace además que el middleware se ejecute en cada navegación por la
// zona: sin una petición al servidor, no habría nada que envolver.
export async function loader({ context }: Route.LoaderArgs) {
  const socio = context.get(socioContext)
  const sesion = context.get(sesionContext)
  return {
    socio: { nombre: socio.nombre, numero: socio.numero, rol: socio.rol },
    cesta: sesion.get('cesta') ?? {},
    productos: productosDeLaSemana(),
  }
}

export default function Zona({ loaderData }: Route.ComponentProps) {
  const { socio, cesta, productos } = loaderData
  return (
    <div className="zona">
      <div className="zona-barra">
        <p className="saludo">
          Hola, <strong>{socio.nombre}</strong> <span className="numero">· n.º de socio {socio.numero}</span>
        </p>
        <ResumenCesta cesta={cesta} productos={productos} />
        <Form method="post" action={href('/salir')}>
          <button type="submit" className="enlace">
            Salir
          </button>
        </Form>
      </div>
      <nav aria-label="Zona de socios" className="zona-menu">
        <NavLink to={href('/socio')} end>
          Tu cesta
        </NavLink>
        <NavLink to={href('/socio/pedido')}>Confirmar el pedido</NavLink>
        <NavLink to={href('/socio/pedidos')} end>
          Tus pedidos
        </NavLink>
        {socio.rol === 'reparto' && (
          // Una ruta de recursos: con reloadDocument, el navegador la pide
          // entera y descarga el archivo, en vez de navegar con React Router.
          <Link reloadDocument to={href('/socio/reparto.csv')}>
            Hoja de reparto (CSV)
          </Link>
        )}
      </nav>
      <Outlet />
    </div>
  )
}
