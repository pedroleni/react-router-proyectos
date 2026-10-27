import { data, href, Link, useRouteLoaderData } from 'react-router'
import { lineasDeCesta, totalDeCesta } from '~/cesta'
import FormularioPedido, { type ResultadoPedido } from '~/componentes/FormularioPedido'
import { socioContext } from '~/contexto.server'
import { tokenPendiente } from '~/datos/pedidos.server'
import { formatearEuros } from '~/dinero'
import { PEDIDO_MINIMO } from '~/validacion/pedido'
import type { Route } from './+types/pedido'
import type { loader as loaderZona } from './zona'

/** Por qué no se puede pedir esta cesta, o null si se puede. */
function problemaDeLaCesta(total: number): string | null {
  if (total === 0) return 'Tu cesta está vacía: añade algo antes de confirmar.'
  if (total < PEDIDO_MINIMO) {
    return `El pedido mínimo es de ${formatearEuros(PEDIDO_MINIMO)}: te faltan ${formatearEuros(PEDIDO_MINIMO - total)}.`
  }
  return null
}

// El token de la compra en curso, para el formulario. Lo guarda el servidor,
// no la cookie: dos pestañas que abren esta página a la vez reciben el mismo,
// y el mismo formulario enviado dos veces no crea dos pedidos.
export async function loader({ context }: Route.LoaderArgs) {
  return { token: await tokenPendiente(context.get(socioContext).id) }
}

export async function action({ request }: Route.ActionArgs) {
  const formulario = await request.formData()
  // Lo que se escribió, para volver a pintar el formulario si hay errores.
  const valores = {
    punto: String(formulario.get('punto') ?? ''),
    dia: String(formulario.get('dia') ?? ''),
    telefono: String(formulario.get('telefono') ?? ''),
    comentario: String(formulario.get('comentario') ?? ''),
  }

  // TODO (paso 4):
  // 0. El token (campo «token»): si ese formulario ya creó un pedido
  //    (pedidoConToken(socio.id, token)), es otra pestaña, un doble clic o un
  //    formulario viejo: redirige a /socio/pedidos sin validar nada más y sin
  //    tocar la sesión. La cesta que haya ahora puede ser de otra compra.
  // 1. Valida el formulario con PedidoFormulario.safeParse(Object.fromEntries(formulario)).
  // 2. Lee la cesta de la sesión (sesionContext; si no hay, {}) y mira si se
  //    puede pedir: problemaDeLaCesta(totalDeCesta(cesta, productosDeLaSemana())).
  // 3. Si algo falla, devuelve con data() un 400 con { errores, valores }:
  //    errores son los fieldErrors de z.flattenError(resultado.error) y, si la
  //    cesta tiene un problema, además errores.cesta = [problema].
  // 4. Si todo va bien: guardarPedido con el socio del context (socioContext),
  //    los datos limpios de Zod, las líneas (lineasDeCesta) y el token. Si el
  //    token no vale, devuelve null, y entonces un 400 con errores.cesta =
  //    ['Este formulario ya no vale. Recarga la página y vuelve a confirmar.'].
  //    Si no, devuelve { pedido, nuevo }: nuevo es false si otro envío con el
  //    mismo token llegó a la vez y ya lo había creado. Solo si nuevo es true,
  //    quita la cesta de la sesión (unset) y deja el aviso flash
  //    `Pedido ${pedido.id} confirmado: recógelo el ${DIAS[pedido.dia]} en ${PUNTOS[pedido.punto]}.`
  //    y devuelve un redirect a /socio/pedidos. La cookie la manda el middleware.
  const errores: ResultadoPedido['errores'] = { cesta: ['Todavía no se pueden confirmar pedidos: falta el paso 4.'] }
  return data({ errores, valores }, { status: 501 })
}

export default function PaginaPedido({ loaderData, actionData }: Route.ComponentProps) {
  const zona = useRouteLoaderData<typeof loaderZona>('routes/zona')
  if (!zona) return null
  const lineas = lineasDeCesta(zona.cesta, zona.productos)

  return (
    <main className="pagina estrecha">
      <title>Confirmar el pedido · La Huerta del Ebro</title>
      <h1>Confirmar el pedido</h1>
      {lineas.length > 0 ? (
        <table className="tabla-cesta">
          <caption>Lo que llevas en la cesta</caption>
          <thead>
            <tr>
              <th scope="col">Producto</th>
              <th scope="col">Cantidad</th>
              <th scope="col">Importe</th>
            </tr>
          </thead>
          <tbody>
            {lineas.map((linea) => (
              <tr key={linea.productoId}>
                <td>
                  {linea.nombre} <span className="formato">({linea.formato})</span>
                </td>
                <td>{linea.cantidad}</td>
                <td>{formatearEuros(linea.precio * linea.cantidad)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={2}>
                Total
              </th>
              <td>{formatearEuros(totalDeCesta(zona.cesta, zona.productos))}</td>
            </tr>
          </tfoot>
        </table>
      ) : (
        <p>
          Tu cesta está vacía. <Link to={href('/socio')}>Llénala antes de confirmar.</Link>
        </p>
      )}
      <FormularioPedido token={loaderData.token} resultado={actionData} />
    </main>
  )
}
