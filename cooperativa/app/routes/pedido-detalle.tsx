import { data, href, isRouteErrorResponse, Link } from 'react-router'
import { socioContext } from '~/contexto.server'
import { buscarPedido } from '~/datos/pedidos.server'
import { formatearEuros } from '~/dinero'
import { DIAS, PUNTOS } from '~/reparto'
import type { Route } from './+types/pedido-detalle'

// Route.LoaderArgs sale de routes.ts: como la ruta es pedidos/:id, params.id
// es un string, no un string | undefined.
export async function loader({ params, context }: Route.LoaderArgs) {
  const socio = context.get(socioContext)
  const pedido = await buscarPedido(params.id)
  // El id llega en la URL y cualquiera puede cambiarlo. Un pedido de otro
  // socio responde lo mismo que uno que no existe: un 404, sin decir de quién es.
  if (!pedido || pedido.socioId !== socio.id) {
    throw data('No encontramos ese pedido entre los tuyos.', { status: 404 })
  }
  return { pedido }
}

export default function PedidoDetalle({ loaderData }: Route.ComponentProps) {
  const { pedido } = loaderData
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
