import { socioContext } from '~/contexto.server'
import type { Route } from './+types/reparto-csv'

// Una ruta de recursos: exporta un loader y ningún componente, así que lo que
// devuelve el loader es la respuesta entera. Cuelga de /socio, de modo que el
// middleware de la zona ya ha comprobado la sesión.
export async function loader({ context }: Route.LoaderArgs) {
  const socio = context.get(socioContext)
  // TODO (paso 5):
  // 1. Tener sesión no basta: si socio.rol no es 'reparto', responde un 403
  //    con un texto, porque la hoja lleva nombres y teléfonos de todos.
  // 2. Ordena los pedidos de la semana (pedidosDeLaSemana(SEMANA.numero)) por
  //    punto, en el ORDEN_DE_REPARTO, después por día y después por id.
  // 3. Una fila de títulos, ['Punto de recogida', 'Día', 'Pedido', 'Socio',
  //    'Teléfono', 'Producto', 'Formato', 'Cantidad', 'Comentario'], y una fila
  //    por cada línea de cada pedido, con PUNTOS, DIAS y el nombre del socio
  //    (buscarSocio).
  // 4. Devuelve new Response(aCsv(filas)) con Content-Type
  //    'text/csv; charset=utf-8' y Content-Disposition
  //    'attachment; filename="hoja-de-reparto-semana-44.csv"' (con SEMANA.numero).
  void socio
  return new Response('Falta la hoja de reparto (paso 5).', { status: 501 })
}
