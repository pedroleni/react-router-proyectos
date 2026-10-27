import { data, href, Link, useRouteLoaderData } from 'react-router'
import { cestaDelFormulario } from '~/cesta'
import ListaCesta from '~/componentes/ListaCesta'
import { sesionContext } from '~/contexto.server'
import { productosDeLaSemana } from '~/datos/catalogo.server'
import type { Route } from './+types/cesta'
import type { loader as loaderZona } from './zona'

// Cada botón de la lista envía la cesta entera, con el cambio que pide. La
// action la valida contra el catálogo y la deja en la sesión; el middleware
// de la zona se encarga de mandar la cookie.
export async function action({ request, context }: Route.ActionArgs) {
  const cesta = cestaDelFormulario(await request.formData(), productosDeLaSemana())
  if (!cesta) {
    return data({ ok: false as const, error: 'No hemos podido cambiar la cesta. Recarga la página y vuelve a probar.' }, { status: 400 })
  }
  context.get(sesionContext).set('cesta', cesta)
  return { ok: true as const }
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
