import { z } from 'zod'
import { data, href, Link, redirect, useRouteLoaderData } from 'react-router'
import { lineasDeCesta, totalDeCesta } from '~/cesta'
import FormularioPedido from '~/componentes/FormularioPedido'
import { sesionContext, socioContext } from '~/contexto.server'
import { productosDeLaSemana } from '~/datos/catalogo.server'
import { guardarPedido, pedidoConToken, tokenPendiente } from '~/datos/pedidos.server'
import { formatearEuros } from '~/dinero'
import { DIAS, PUNTOS } from '~/reparto'
import { PEDIDO_MINIMO, PedidoFormulario } from '~/validacion/pedido'
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

export async function action({ request, context }: Route.ActionArgs) {
  const socio = context.get(socioContext)
  const sesion = context.get(sesionContext)
  const formulario = await request.formData()
  const token = String(formulario.get('token') ?? '')

  // Este formulario ya creó un pedido (otra pestaña, un doble clic, un
  // formulario viejo): a tus pedidos, sin guardar otro y sin tocar la sesión.
  // La cesta que haya ahora puede ser la de otra compra, y no es suya.
  if (await pedidoConToken(socio.id, token)) return redirect(href('/socio/pedidos'))

  // Lo que se escribió, para volver a pintar el formulario si hay errores.
  const valores = {
    punto: String(formulario.get('punto') ?? ''),
    dia: String(formulario.get('dia') ?? ''),
    telefono: String(formulario.get('telefono') ?? ''),
    comentario: String(formulario.get('comentario') ?? ''),
  }
  const resultado = PedidoFormulario.safeParse(Object.fromEntries(formulario))

  // La cesta no viaja en el formulario: está en la sesión, y es la que vale.
  const productos = productosDeLaSemana()
  const cesta = sesion.get('cesta') ?? {}
  const problema = problemaDeLaCesta(totalDeCesta(cesta, productos))

  if (!resultado.success || problema) {
    const errores: Partial<Record<keyof typeof valores | 'cesta', string[]>> = resultado.success
      ? {}
      : z.flattenError(resultado.error).fieldErrors
    if (problema) errores.cesta = [problema]
    // 400: los datos no valen. Devuelto, no lanzado: el formulario sigue en
    // pantalla con sus errores.
    return data({ errores, valores }, { status: 400 })
  }

  // Con el token del formulario: si dos envíos con el mismo llegan a la vez,
  // guardarPedido devuelve al segundo el pedido del primero; si el token no es
  // el de la compra en curso, null.
  const guardado = await guardarPedido({ socioId: socio.id, ...resultado.data, lineas: lineasDeCesta(cesta, productos), token })
  if (!guardado) {
    const errores = { cesta: ['Este formulario ya no vale. Recarga la página y vuelve a confirmar.'] }
    return data({ errores, valores }, { status: 400 })
  }

  // Solo quien acaba de crear el pedido vacía la cesta y deja el aviso, que
  // dura hasta que alguien lo lee. Un envío repetido que llegó a la vez, no.
  const { pedido, nuevo } = guardado
  if (nuevo) {
    sesion.unset('cesta')
    sesion.flash('aviso', `Pedido ${pedido.id} confirmado: recógelo el ${DIAS[pedido.dia]} en ${PUNTOS[pedido.punto]}.`)
  }
  // POST, redirección y GET: si recargas la página de destino, no se pide dos veces.
  return redirect(href('/socio/pedidos'))
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
