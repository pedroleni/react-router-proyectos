import { describe, expect, it } from 'vitest'
import { loader } from '~/routes/pedido-detalle'
import { argumentos, contextoDeSocio, PILAR } from './peticion'

type Args = Parameters<typeof loader>[0]

async function verPedido(id: string) {
  const { context } = await contextoDeSocio(PILAR)
  return loader(argumentos<Args>(`/socio/pedidos/${id}`, { params: { id }, context }))
}

describe('Paso 8: el detalle de un pedido, con los tipos generados', () => {
  it('Pilar ve su pedido de la semana pasada', async () => {
    const { pedido } = await verPedido('P-43-0012')
    expect(pedido).toMatchObject({ id: 'P-43-0012', total: 1120 })
  })

  it('el pedido de otro socio responde 404, como si no existiera', async () => {
    await expect(verPedido('P-44-0001')).rejects.toMatchObject({ init: { status: 404 } })
  })

  it('un pedido que no existe responde 404', async () => {
    await expect(verPedido('P-44-9999')).rejects.toMatchObject({ init: { status: 404 } })
  })
})
