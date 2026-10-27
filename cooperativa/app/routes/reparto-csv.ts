import { socioContext } from '~/contexto.server'
import { aCsv } from '~/csv'
import { SEMANA } from '~/datos/catalogo.server'
import { pedidosDeLaSemana } from '~/datos/pedidos.server'
import { buscarSocio } from '~/datos/socios.server'
import { DIAS, ORDEN_DE_REPARTO, PUNTOS } from '~/reparto'
import type { Route } from './+types/reparto-csv'

// Una ruta de recursos: exporta un loader y ningún componente, así que lo que
// devuelve el loader es la respuesta entera. Cuelga de /socio, de modo que el
// middleware de la zona ya ha comprobado la sesión.
export async function loader({ context }: Route.LoaderArgs) {
  const socio = context.get(socioContext)
  // Tener sesión no basta: la hoja lleva nombres y teléfonos de todos.
  if (socio.rol !== 'reparto') {
    return new Response('Solo la coordinación de reparto puede descargar la hoja.', {
      status: 403,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const pedidos = (await pedidosDeLaSemana(SEMANA.numero)).sort(
    (a, b) =>
      ORDEN_DE_REPARTO.indexOf(a.punto) - ORDEN_DE_REPARTO.indexOf(b.punto) ||
      a.dia.localeCompare(b.dia) ||
      a.id.localeCompare(b.id),
  )

  const filas: (string | number)[][] = [
    ['Punto de recogida', 'Día', 'Pedido', 'Socio', 'Teléfono', 'Producto', 'Formato', 'Cantidad', 'Comentario'],
  ]
  for (const pedido of pedidos) {
    const nombre = buscarSocio(pedido.socioId)?.nombre ?? pedido.socioId
    for (const linea of pedido.lineas) {
      filas.push([
        PUNTOS[pedido.punto],
        DIAS[pedido.dia],
        pedido.id,
        nombre,
        pedido.telefono,
        linea.nombre,
        linea.formato,
        linea.cantidad,
        pedido.comentario,
      ])
    }
  }

  return new Response(aCsv(filas), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      // attachment: el navegador lo descarga con este nombre en vez de enseñarlo.
      'Content-Disposition': `attachment; filename="hoja-de-reparto-semana-${SEMANA.numero}.csv"`,
    },
  })
}
