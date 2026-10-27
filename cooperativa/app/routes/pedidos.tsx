import { Link } from 'react-router'
import { socioContext } from '~/contexto.server'
import { pedidosDeSocio } from '~/datos/pedidos.server'
import { formatearEuros } from '~/dinero'
import type { Route } from './+types/pedidos'

export async function loader({ context }: Route.LoaderArgs) {
  const socio = context.get(socioContext)
  return {
    // TODO (paso 4): el aviso que dejó la action del pedido, leído de la sesión
    // del context (sesionContext) con get('aviso'), o null. Leerlo lo borra.
    aviso: null as string | null,
    pedidos: await pedidosDeSocio(socio.id),
  }
}

const fecha = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'Europe/Madrid' })

export default function Pedidos({ loaderData }: Route.ComponentProps) {
  const { aviso, pedidos } = loaderData
  return (
    <main className="pagina estrecha">
      <title>Tus pedidos · La Huerta del Ebro</title>
      <h1>Tus pedidos</h1>
      {/* role="status" está siempre en la página: así se anuncia cuando llega el aviso. */}
      <p role="status" className={aviso ? 'aviso' : 'aviso vacio'}>
        {aviso}
      </p>
      {pedidos.length === 0 ? (
        <p>Todavía no has hecho ningún pedido.</p>
      ) : (
        <ul className="lista-pedidos">
          {pedidos.map((pedido) => (
            <li key={pedido.id}>
              {/* TODO (paso 8): escribe esta dirección con href(). Al hacerlo,
                  TypeScript te dirá qué tiene de malo. */}
              <Link to={`/socio/pedido/${pedido.id}`}>Pedido {pedido.id}</Link>
              <span>
                {' '}
                · semana {pedido.semana} · {fecha.format(new Date(pedido.creado))} · {formatearEuros(pedido.total)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
