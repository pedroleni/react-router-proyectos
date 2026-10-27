import { describe, expect, it } from 'vitest'
import type { Config } from '@react-router/dev/config'
import configuracion from '../react-router.config'
import { action as entrar } from '~/routes/entrar'
import { destinoSeguro } from '~/seguridad'
import { argumentos, envio, respuesta } from './peticion'

type ArgsEntrar = Parameters<typeof entrar>[0]
const peticion = new Request('http://localhost:5173/entrar')
const config: Config = configuracion

describe('Paso 7: ?volver= validado y allowedActionOrigins', () => {
  it('destinoSeguro deja pasar las direcciones de la propia web, con su búsqueda', () => {
    expect(destinoSeguro('/socio/pedido', peticion)).toBe('/socio/pedido')
    expect(destinoSeguro('/socio/pedidos?semana=44', peticion)).toBe('/socio/pedidos?semana=44')
    expect(destinoSeguro(null, peticion)).toBe('/socio')
  })

  it.each([
    'https://malo.example/socio',
    '//malo.example/socio',
    '/\\malo.example/socio',
    'javascript:alert(1)',
    '/\t/malo.example',
    // De nuestro origen, pero new URL normaliza la ruta y queda en //malo.example
    '/.//malo.example',
    '/a/..//malo.example',
    '/%2e//malo.example',
    '/..//malo.example/socio',
    '/%2e%2e//malo.example',
  ])('destinoSeguro no deja salir a otra web: %j acaba en /socio', (volver) => {
    expect(destinoSeguro(volver, peticion)).toBe('/socio')
  })

  it('después de entrar, un ?volver= de otra web lleva a la zona de socios', async () => {
    const datos = { correo: 'pilar@huertadelebro.example', clave: 'borraja2026', volver: '//malo.example/entrar' }
    const redireccion = respuesta(await entrar(argumentos<ArgsEntrar>('/entrar', { init: envio(datos) })))
    expect(redireccion.headers.get('Location')).toBe('/socio')
  })

  it('los formularios aceptan envíos con el origen público de la cooperativa', () => {
    expect(config.allowedActionOrigins).toEqual(['pedidos.huertadelebro.es'])
  })
})
