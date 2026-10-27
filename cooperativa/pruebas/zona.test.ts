import { RouterContextProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { sesionContext, socioContext } from '~/contexto.server'
import { exigirSocio } from '~/middleware/socio.server'
import { action as entrar } from '~/routes/entrar'
import { middleware } from '~/routes/zona'
import { argumentos, cookieDe, envio, respuesta } from './peticion'

type ArgsMiddleware = Parameters<typeof exigirSocio>[0]
type ArgsEntrar = Parameters<typeof entrar>[0]

/** La cookie de sesión de Pilar, como la dejaría el paso 1. */
async function cookieDePilar() {
  const entrada = respuesta(
    await entrar(argumentos<ArgsEntrar>('/entrar', { init: envio({ correo: 'pilar@huertadelebro.example', clave: 'borraja2026' }) })),
  )
  return cookieDe(entrada.headers.get('Set-Cookie'))
}

/** Un next() de mentira: hace de loader y devuelve una respuesta. */
const siguiente = (hacer: () => void = () => {}) => async () => {
  hacer()
  return new Response('la página')
}

describe('Paso 2: un middleware que protege la zona de socios', () => {
  it('la zona exporta el middleware', () => {
    expect(middleware).toContain(exigirSocio)
  })

  it('sin sesión, manda a /entrar y apunta en ?volver= la página, sin el .data', async () => {
    // Una navegación del navegador: la petición es /socio/pedido.data.
    const args = argumentos<ArgsMiddleware>('/socio/pedido.data?semana=44')
    const lanzado = await Promise.resolve(exigirSocio(args, siguiente())).catch((e: unknown) => e)
    const redireccion = respuesta(lanzado)
    expect(redireccion.status).toBe(302)
    expect(redireccion.headers.get('Location')).toBe('/entrar?volver=%2Fsocio%2Fpedido%3Fsemana%3D44')
  })

  it('con sesión, deja al socio en el context antes del loader y marca la respuesta como privada', async () => {
    const context = new RouterContextProvider()
    const args = argumentos<ArgsMiddleware>('/socio', { init: { headers: { Cookie: await cookieDePilar() } }, context })
    let visto = ''
    const pagina = respuesta(await exigirSocio(args, siguiente(() => (visto = context.get(socioContext).nombre))))

    expect(visto).toBe('Pilar Lasierra')
    expect(pagina.headers.get('Cache-Control')).toBe('private, no-store')
  })

  it('solo manda la cookie cuando la sesión ha cambiado', async () => {
    const cookie = await cookieDePilar()

    const sinCambios = new RouterContextProvider()
    const leer = respuesta(
      await exigirSocio(argumentos<ArgsMiddleware>('/socio', { init: { headers: { Cookie: cookie } }, context: sinCambios }), siguiente()),
    )
    expect(leer.headers.get('Set-Cookie')).toBeNull()

    const conCambios = new RouterContextProvider()
    const cambiar = respuesta(
      await exigirSocio(
        argumentos<ArgsMiddleware>('/socio', { init: { headers: { Cookie: cookie } }, context: conCambios }),
        siguiente(() => conCambios.get(sesionContext).set('cesta', { borraja: 1 })),
      ),
    )
    expect(cambiar.headers.get('Set-Cookie')).toMatch(/^__sesion=/)
  })
})
