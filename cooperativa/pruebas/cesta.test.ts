import { describe, expect, it } from 'vitest'
import { aplicarCambio, cestaDelFormulario } from '~/cesta'
import { productosDeLaSemana } from '~/datos/catalogo.server'
import { action } from '~/routes/cesta'
import { argumentos, contextoDeSocio, envio, PILAR } from './peticion'

type Args = Parameters<typeof action>[0]
const productos = productosDeLaSemana()

/** Lo que envía la lista de la cesta: una cantidad por producto y el botón pulsado. */
function formulario(cesta: Record<string, number>, cambio: string): Record<string, string> {
  const campos: Record<string, string> = {}
  for (const producto of productos) campos[`cantidad-${producto.id}`] = String(cesta[producto.id] ?? 0)
  return { ...campos, cambio }
}

describe('Paso 3: la cesta en la sesión', () => {
  it('aplicarCambio suma y resta sin bajar de 0 ni pasar del máximo', () => {
    expect(aplicarCambio({}, { tipo: 'sumar', productoId: 'borraja' }, productos)).toEqual({ borraja: 1 })
    expect(aplicarCambio({ borraja: 1 }, { tipo: 'restar', productoId: 'borraja' }, productos)).toEqual({})
    expect(aplicarCambio({ aceite: 2 }, { tipo: 'sumar', productoId: 'aceite' }, productos)).toEqual({ aceite: 2 })
    expect(aplicarCambio({ aceite: 2, pan: 1 }, { tipo: 'vaciar' }, productos)).toEqual({})
  })

  it('cestaDelFormulario lee las cantidades y el cambio, y rechaza lo que no cuadra', () => {
    const datos = new URLSearchParams(formulario({ tomate: 2 }, 'sumar:borraja'))
    const leer = (campos: URLSearchParams) => {
      const fd = new FormData()
      campos.forEach((valor, campo) => fd.append(campo, valor))
      return cestaDelFormulario(fd, productos)
    }
    expect(leer(datos)).toEqual({ tomate: 2, borraja: 1 })

    datos.set('cantidad-tomate', '9')
    expect(leer(datos)).toBeNull()
    datos.set('cantidad-tomate', '2')
    datos.set('cambio', 'sumar:caviar')
    expect(leer(datos)).toBeNull()
    datos.set('cambio', 'regalar:borraja')
    expect(leer(datos)).toBeNull()
  })

  it('la action guarda en la sesión la cesta enviada, con el cambio aplicado', async () => {
    const { context, sesion } = await contextoDeSocio(PILAR, { tomate: 1 })
    const resultado = await action(argumentos<Args>('/socio?index', { init: envio(formulario({ tomate: 1, huevos: 1 }, 'sumar:tomate')), context }))
    expect(resultado).toEqual({ ok: true })
    expect(sesion.get('cesta')).toEqual({ tomate: 2, huevos: 1 })
  })

  it('un envío que no cuadra responde 400 y la cesta de la sesión no cambia', async () => {
    const { context, sesion } = await contextoDeSocio(PILAR, { tomate: 1 })
    const resultado = await action(argumentos<Args>('/socio?index', { init: envio(formulario({ aceite: 7 }, 'sumar:pan')), context }))
    expect(resultado).toMatchObject({ data: { ok: false }, init: { status: 400 } })
    expect(sesion.get('cesta')).toEqual({ tomate: 1 })
  })
})
