import { describe, expect, it } from 'vitest'
import { pedidosDeSocio } from '~/datos/pedidos.server'
import { action as accionCesta } from '~/routes/cesta'
import { action as entrar } from '~/routes/entrar'
import { action, loader as loaderPedido } from '~/routes/pedido'
import { loader as loaderPedidos } from '~/routes/pedidos'
import { PedidoFormulario } from '~/validacion/pedido'
import { argumentos, atender, contextoDeSocio, cookieDe, envio, PILAR, respuesta } from './peticion'

type Args = Parameters<typeof action>[0]
type ArgsPedidos = Parameters<typeof loaderPedidos>[0]
type ArgsPedido = Parameters<typeof loaderPedido>[0]
type ArgsEntrar = Parameters<typeof entrar>[0]

const BUENOS = { punto: 'actur', dia: 'jueves', telefono: ' 654210987 ', comentario: 'Sin bolsa, traigo la mía.' }
// 2 kg de tomate (7,80 €) y una docena de huevos (3,60 €): 11,40 €.
const CESTA = { tomate: 2, huevos: 1 }

/**
 * Lo que pasa al abrir la página del pedido: su loader pide al servidor el
 * token de la compra en curso (tokenPendiente), que no va en la sesión.
 * Devuelve el context, la sesión y el formulario con ese token.
 */
async function abrirPedido(cesta: Record<string, number>, campos: Record<string, string> = BUENOS) {
  const { context, sesion } = await contextoDeSocio(PILAR, cesta)
  const { token } = await loaderPedido(argumentos<ArgsPedido>('/socio/pedido', { context }))
  return { context, sesion, token, formulario: { ...campos, token } }
}

describe('Paso 4: el pedido, validado con Zod', () => {
  it('el esquema acepta un pedido bueno y limpia los espacios del teléfono', () => {
    const resultado = PedidoFormulario.safeParse(BUENOS)
    expect(resultado.success).toBe(true)
    expect(resultado.data).toEqual({ ...BUENOS, telefono: '654210987' })
    // El comentario es opcional.
    expect(PedidoFormulario.safeParse({ ...BUENOS, comentario: undefined }).data?.comentario).toBe('')
  })

  it('con errores, la action responde 400 con un mensaje por campo y lo que se escribió', async () => {
    const { context, token } = await abrirPedido(CESTA)
    const resultado = await action(argumentos<Args>('/socio/pedido', { init: envio({ dia: 'domingo', telefono: '12345', token }), context }))
    expect(resultado).toMatchObject({
      init: { status: 400 },
      data: {
        errores: {
          punto: ['Elige dónde recogerás la cesta.'],
          dia: ['Elige qué día la recogerás.'],
          telefono: ['Escribe un teléfono de nueve cifras, sin espacios: 612345678.'],
        },
        valores: { punto: '', dia: 'domingo', telefono: '12345', comentario: '' },
      },
    })
  })

  it('con la cesta por debajo del mínimo, responde 400 y dice cuánto falta', async () => {
    const { context, formulario } = await abrirPedido({ huevos: 1 })
    const resultado = await action(argumentos<Args>('/socio/pedido', { init: envio(formulario), context }))
    expect(resultado).toMatchObject({
      init: { status: 400 },
      // Intl.NumberFormat separa el número y el € con un espacio duro (U+00A0).
      data: { errores: { cesta: ['El pedido mínimo es de 10,00\u00a0€: te faltan 6,40\u00a0€.'] } },
    })
    expect(await pedidosDeSocio(PILAR)).toHaveLength(1)
  })

  it('con todo bien, guarda el pedido, vacía la cesta, deja un aviso y redirige a tus pedidos', async () => {
    const { context, sesion, formulario } = await abrirPedido(CESTA)
    const redireccion = respuesta(await action(argumentos<Args>('/socio/pedido', { init: envio(formulario), context })))
    expect(redireccion.status).toBe(302)
    expect(redireccion.headers.get('Location')).toBe('/socio/pedidos')

    const [pedido] = await pedidosDeSocio(PILAR)
    expect(pedido).toMatchObject({ id: 'P-44-0005', punto: 'actur', dia: 'jueves', telefono: '654210987', total: 1140 })
    expect(pedido.lineas.map((l) => [l.productoId, l.cantidad])).toEqual([
      ['tomate', 2],
      ['huevos', 1],
    ])
    expect(sesion.get('cesta')).toBeUndefined()
    expect(sesion.has('aviso')).toBe(true)
  })

  it('dos pestañas que abren el pedido a la vez desde la misma cookie y lo confirman guardan un solo pedido', async () => {
    // La cookie de Pilar con su cesta, como la dejan los pasos 1 y 3.
    const entrada = respuesta(await entrar(argumentos<ArgsEntrar>('/entrar', { init: envio({ correo: 'pilar@huertadelebro.example', clave: 'borraja2026' }) })))
    let cookie = cookieDe(entrada.headers.get('Set-Cookie'))
    const llenar = await atender('/socio?index', envio({ 'cantidad-tomate': '2', 'cantidad-huevos': '0', cambio: 'sumar:huevos' }, { Cookie: cookie }), accionCesta)
    cookie = cookieDe(llenar.respuesta.headers.get('Set-Cookie'))

    // Dos cargas de /socio/pedido a la vez, con la misma cookie de partida.
    const [cargaA, cargaB] = await Promise.all([
      atender('/socio/pedido', { headers: { Cookie: cookie } }, loaderPedido),
      atender('/socio/pedido', { headers: { Cookie: cookie } }, loaderPedido),
    ])
    // Cada pestaña se queda con su cookie: la nueva, si la carga trajo Set-Cookie.
    const cookieA = cargaA.respuesta.headers.get('Set-Cookie') ? cookieDe(cargaA.respuesta.headers.get('Set-Cookie')) : cookie
    const cookieB = cargaB.respuesta.headers.get('Set-Cookie') ? cookieDe(cargaB.respuesta.headers.get('Set-Cookie')) : cookie
    const tokenA = (cargaA.datos as { token: string }).token
    const tokenB = (cargaB.datos as { token: string }).token
    expect(tokenB).toBe(tokenA)

    // Los dos formularios, enviados a la vez como los enviaría el navegador.
    const [envioA, envioB] = await Promise.all([
      atender('/socio/pedido', envio({ ...BUENOS, token: tokenA }, { Cookie: cookieA }), action),
      atender('/socio/pedido', envio({ ...BUENOS, token: tokenB }, { Cookie: cookieB }), action),
    ])
    expect(envioA.respuesta.status).toBe(302)
    expect(envioB.respuesta.status).toBe(302)
    expect((await pedidosDeSocio(PILAR)).map((p) => p.id)).toEqual(['P-44-0005', 'P-43-0012'])
  })

  it('reenviar después el formulario de un pedido ya confirmado no guarda otro ni toca la cesta nueva', async () => {
    // 1. Pilar confirma el pedido 1.
    const primero = await abrirPedido(CESTA)
    await action(argumentos<Args>('/socio/pedido', { init: envio(primero.formulario), context: primero.context }))
    // 2. Llena una cesta nueva y abre su formulario, con un token nuevo.
    const segundo = await abrirPedido({ aceite: 1, pan: 1 })
    expect(segundo.token).not.toBe(primero.token)
    // 3. Desde otra pestaña, con esa misma sesión, reenvía el formulario del pedido 1.
    const reenvio = respuesta(await action(argumentos<Args>('/socio/pedido', { init: envio(primero.formulario), context: segundo.context })))
    expect(reenvio.headers.get('Location')).toBe('/socio/pedidos')
    expect(await pedidosDeSocio(PILAR)).toHaveLength(2)
    // La cesta 2 sigue ahí, y no aparece un aviso de un pedido que no se ha hecho ahora.
    expect(segundo.sesion.get('cesta')).toEqual({ aceite: 1, pan: 1 })
    expect(segundo.sesion.has('aviso')).toBe(false)
    // Y el formulario de la cesta 2 sigue valiendo.
    const pedido2 = respuesta(await action(argumentos<Args>('/socio/pedido', { init: envio(segundo.formulario), context: segundo.context })))
    expect(pedido2.headers.get('Location')).toBe('/socio/pedidos')
    expect(await pedidosDeSocio(PILAR)).toHaveLength(3)

    const tercera = await abrirPedido(CESTA)
    const inventado = await action(argumentos<Args>('/socio/pedido', { init: envio({ ...BUENOS, token: 'me-lo-invento' }), context: tercera.context }))
    expect(inventado).toMatchObject({
      init: { status: 400 },
      data: { errores: { cesta: ['Este formulario ya no vale. Recarga la página y vuelve a confirmar.'] } },
    })
    expect(await pedidosDeSocio(PILAR)).toHaveLength(3)
  })

  it('el aviso sale una sola vez en tus pedidos', async () => {
    const { context, formulario } = await abrirPedido(CESTA)
    await action(argumentos<Args>('/socio/pedido', { init: envio(formulario), context }))

    const primera = await loaderPedidos(argumentos<ArgsPedidos>('/socio/pedidos', { context }))
    expect(primera.aviso).toBe('Pedido P-44-0005 confirmado: recógelo el jueves 29, de 18:00 a 20:30 en Actur, en el centro cívico.')
    expect(primera.pedidos[0].id).toBe('P-44-0005')

    const segunda = await loaderPedidos(argumentos<ArgsPedidos>('/socio/pedidos', { context }))
    expect(segunda.aviso).toBeNull()
  })
})
