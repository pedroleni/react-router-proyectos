import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createRoutesStub } from 'react-router'
import { describe, expect, it } from 'vitest'
import configuracion from '../react-router.config'
import handleRequest, { cabecerasDeSeguridad } from '~/entry.server'
import { destinoSeguro } from '~/seguridad'
import { action as entrar } from '~/routes/entrar'
import Reserva from '~/routes/hospitaleros/reserva'
import { exigirHospitalero } from '~/middleware/hospitalero.server'
import { argumentos, envio, respuesta } from './peticion'

describe('lección 20: seguridad', () => {
  it.each([
    ['/hospitaleros', '/hospitaleros'],
    ['/hospitaleros/reservas/r-1?x=1#y', '/hospitaleros/reservas/r-1?x=1#y'],
    ['/%0d%0aSet-Cookie', '/por-defecto'],
    ['/entrar', '/por-defecto'],
    ['/salir', '/por-defecto'],
    ['\t/x', '/por-defecto'],
  ])('valida el destino %j', (entrada, esperado) => {
    expect(destinoSeguro(entrada, '/por-defecto')).toBe(esperado)
  })

  it('autoriza el host público detrás del proxy', () => {
    expect(configuracion.allowedActionOrigins).toEqual(['albergue-el-cea.es'])
  })

  it('entrar y el middleware aplican las restricciones nuevas, no solo el helper', async () => {
    const entrada = respuesta(
      await entrar(
        argumentos<Parameters<typeof entrar>[0]>('/entrar', {
          init: envio({ usuario: 'marta', clave: 'camino2026', volver: '/salir' }),
        })
      )
    )
    expect(entrada.headers.get('Location')).toBe('/hospitaleros')

    let lanzado: Response | undefined
    try {
      await exigirHospitalero(
        argumentos<Parameters<typeof exigirHospitalero>[0]>('/entrar'),
        async () => new Response('no debe llegar')
      )
    } catch (error) {
      if (error instanceof Response) lanzado = error
    }
    expect(lanzado?.headers.get('Location')).toBe('/entrar?volver=%2Fhospitaleros')
  })

  it('el title de una reserva usa el id, nunca el nombre aportado', () => {
    const nombre = 'Nombre privado escrito por el usuario'
    const props = {
      loaderData: {
        reserva: {
          id: 'r-segura',
          noche: '2031-06-01',
          nombre,
          documento: '***123',
          personas: 1,
          estado: 'llegada',
          credencial: null,
        },
      },
      actionData: undefined,
    }
    const Stub = createRoutesStub([{ path: '/', Component: () => createElement(Reserva, props as never) }])
    const html = renderToStaticMarkup(createElement(Stub))
    expect(html).toContain('<title>Reserva r-segura | El Cea</title>')
    expect(html.match(/<title>(.*?)<\/title>/)?.[1]).not.toContain(nombre)
  })

  it('crea una CSP de producción con el nonce recibido', () => {
    const primera = cabecerasDeSeguridad('nonce-uno', 'production')['Content-Security-Policy']
    const segunda = cabecerasDeSeguridad('nonce-dos', 'production')['Content-Security-Policy']
    expect(primera).toContain("script-src 'self' 'nonce-nonce-uno'")
    expect(segunda).toContain("'nonce-nonce-dos'")
    expect(primera).not.toBe(segunda)
  })

  it('añade las cabeceras habituales y relaja la CSP solo en desarrollo', () => {
    const cabeceras = cabecerasDeSeguridad('prueba', 'development')
    expect(cabeceras).toMatchObject({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    })
    expect(cabeceras['Content-Security-Policy']).toBeUndefined()
  })

  it('handleRequest aplica cabeceras y un nonce distinto por petición', async () => {
    process.env.NODE_ENV = 'production'
    const primera = await handleRequest(
      new Request('https://ejemplo.test/', { method: 'HEAD' }),
      200,
      new Headers(),
      {} as never,
      {} as never
    )
    const segunda = await handleRequest(
      new Request('https://ejemplo.test/', { method: 'HEAD' }),
      200,
      new Headers(),
      {} as never,
      {} as never
    )
    expect(primera.headers.get('Content-Security-Policy')).toContain('nonce-')
    expect(primera.headers.get('Content-Security-Policy')).not.toBe(
      segunda.headers.get('Content-Security-Policy')
    )
    expect(primera.headers.get('X-Content-Type-Options')).toBe('nosniff')
  })

  it('pasa el nonce a ServerRouter y al stream de React', async () => {
    const entrada = await readFile(join(process.cwd(), 'app', 'entry.server.tsx'), 'utf8')
    expect(entrada).toContain('<ServerRouter context={routerContext} url={request.url} nonce={nonce} />')
    expect(entrada).toMatch(/renderToPipeableStream\([\s\S]*?\{[\s\S]*?nonce,/)
  })
})
