import { data, href, Link, useRouteLoaderData } from 'react-router'
import ListaCesta from '~/componentes/ListaCesta'
import type { Route } from './+types/cesta'
import type { loader as loaderZona } from './zona'

// Cada botón de la lista envía la cesta entera, con el cambio que pide. La
// action la valida contra el catálogo y la deja en la sesión; el middleware
// de la zona se encarga de mandar la cookie.
export async function action(_: Route.ActionArgs) {
  // TODO (paso 3): lee el formulario y saca la cesta que pide con
  // cestaDelFormulario(formulario, productosDeLaSemana()).
  // - Si es null, devuelve con data() un 400 con { ok: false as const, error:
  //   'No hemos podido cambiar la cesta. Recarga la página y vuelve a probar.' }.
  // - Si no, guárdala en la sesión del context (sesionContext) con
  //   set('cesta', …) y devuelve { ok: true as const }. La cookie la manda el
  //   middleware de la zona.
  return data({ ok: false as const, error: 'Falta la action de la cesta (paso 3).' }, { status: 501 })
}

export default function PaginaCesta() {
  // La cesta y el catálogo ya los carga la zona, la ruta madre.
  const zona = useRouteLoaderData<typeof loaderZona>('routes/zona')
  if (!zona) return null
  return (
    <main className="pagina">
      <title>Tu cesta · La Huerta del Ebro</title>
      <h1>Tu cesta de esta semana</h1>
      <ListaCesta cesta={zona.cesta} productos={zona.productos} />
      <p className="acciones">
        <Link to={href('/socio/pedido')} className="boton">
          Confirmar el pedido
        </Link>
      </p>
    </main>
  )
}
