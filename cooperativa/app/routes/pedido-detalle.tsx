import { data, href, isRouteErrorResponse, Link, useLoaderData, type LoaderFunctionArgs } from 'react-router'
import { buscarPedido } from '~/datos/pedidos.server'
import { formatearEuros } from '~/dinero'
import { DIAS, PUNTOS } from '~/reparto'
import type { Pedido } from '~/tipos'
import type { Route } from './+types/pedido-detalle'

// TODO (paso 8): este módulo está escrito como en el modo datos, con
// LoaderFunctionArgs y useLoaderData() sin tipos. npm run typecheck se queja
// de params.id. Pásalo a los tipos generados: Route.LoaderArgs en el loader y
// { loaderData }: Route.ComponentProps en el componente.
export async function loader({ params }: LoaderFunctionArgs) {
  const pedido = await buscarPedido(params.id)
  // TODO (paso 8): el id llega en la URL y cualquiera puede cambiarlo. Lee el
  // socio del context (socioContext) y, si el pedido es de otro, responde lo
  // mismo que si no existiera.
  if (!pedido) {
    throw data('No encontramos ese pedido entre los tuyos.', { status: 404 })
  }
  return { pedido }
}

export default function PedidoDetalle() {
  const { pedido } = useLoaderData() as { pedido: Pedido }
  return (
    <main className="pagina estrecha">
      <title>{`Pedido ${pedido.id} · La Huerta del Ebro`}</title>
      <h1>Pedido {pedido.id}</h1>
      <p>
        Recogida el {DIAS[pedido.dia]} en {PUNTOS[pedido.punto]}.
      </p>
      <ul>
        {pedido.lineas.map((linea) => (
          <li key={linea.productoId}>
            {linea.cantidad} × {linea.nombre} ({linea.formato}) · {formatearEuros(linea.precio * linea.cantidad)}
          </li>
        ))}
      </ul>
      <p className="total">Total: {formatearEuros(pedido.total)}</p>
      {pedido.comentario && <p>Tu comentario: «{pedido.comentario}»</p>}
      <p>
        <Link to={href('/socio/pedidos')}>Volver a tus pedidos</Link>
      </p>
    </main>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const noExiste = isRouteErrorResponse(error) && error.status === 404
  return (
    <main className="pagina estrecha">
      <title>Pedido no encontrado · La Huerta del Ebro</title>
      <h1>{noExiste ? 'Pedido no encontrado' : 'No hemos podido cargar este pedido'}</h1>
      <p>{noExiste ? 'No encontramos ese pedido entre los tuyos.' : 'Inténtalo de nuevo dentro de un rato.'}</p>
      <p>
        <Link to={href('/socio/pedidos')}>Volver a tus pedidos</Link>
      </p>
    </main>
  )
}
