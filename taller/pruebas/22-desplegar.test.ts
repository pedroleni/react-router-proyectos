import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { RouterContextProvider, createRequestHandler, data, type ServerBuild } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { handleError, instrumentations } from '~/entry.server'
import { informarError } from '~/errores.server'
import { tokenDeAvisos } from '~/config.server'
import { action as avisos } from '~/routes/recursos/avisos'
import { argumentos } from './peticion'

describe('lección 22: desplegar y vigilar', () => {
  it('handleError ignora una petición abortada e informa las demás', () => {
    const consola = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const controlador = new AbortController()
    controlador.abort()
    handleError(new Error('cancelado'), {
      request: new Request('https://ejemplo.test/cancelada', { signal: controlador.signal }),
      context: new RouterContextProvider(),
      params: {},
    })
    expect(consola).not.toHaveBeenCalled()
    handleError(new Error('fallo'), {
      request: new Request('https://ejemplo.test/ruta', { method: 'POST' }),
      context: new RouterContextProvider(),
      params: {},
    })
    const linea = JSON.parse(String(consola.mock.calls[0][0]))
    expect(linea).toMatchObject({ url: 'https://ejemplo.test/ruta', metodo: 'POST', mensaje: 'fallo' })
  })

  it('informarError escribe una línea JSON sin pila en producción', () => {
    process.env.NODE_ENV = 'production'
    const consola = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    informarError(new Error('visible'), { url: 'https://ejemplo.test', metodo: 'GET' })
    expect(consola).toHaveBeenCalledTimes(1)
    const linea = JSON.parse(String(consola.mock.calls[0][0]))
    expect(linea.mensaje).toBe('visible')
    expect(linea.pila).toBeUndefined()
  })

  it('informarError conserva el estado de un ErrorResponse', () => {
    process.env.NODE_ENV = 'production'
    const consola = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    informarError(
      { status: 400, statusText: 'Bad Request', internal: false, data: 'Petición incorrecta' },
      { url: 'https://ejemplo.test/salir', metodo: 'GET' },
    )
    const linea = JSON.parse(String(consola.mock.calls[0][0]))
    expect(linea).toMatchObject({ mensaje: '400 Bad Request', status: 400, statusText: 'Bad Request' })
  })

  it('sin AVISOS_TOKEN en producción responde 503 y lo registra', async () => {
    process.env.NODE_ENV = 'production'
    delete process.env.AVISOS_TOKEN
    const consola = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const respuesta = await avisos(
      argumentos<Parameters<typeof avisos>[0]>('/api/avisos', { init: { method: 'POST', body: '{}' } }),
    )
    expect(respuesta.status).toBe(503)
    expect(consola).toHaveBeenCalledOnce()
  })

  it('exige un token de avisos largo en producción', () => {
    expect(() => tokenDeAvisos({ NODE_ENV: 'production', AVISOS_TOKEN: 'corto' })).toThrow('32 caracteres')
  })

  it('la instrumentación registra el resultado y el error del loader', async () => {
    const consola = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    let loader: ((ejecutar: () => Promise<unknown>, info: unknown) => Promise<void>) | undefined
    instrumentations[0].route?.({
      id: 'ruta-prueba',
      index: false,
      path: '/prueba',
      instrument(instrumentos) {
        loader = instrumentos.loader as typeof loader
      },
    })
    await loader?.(async () => ({ status: 'error', error: new Error('loader roto') }), {
      request: { method: 'GET', url: 'https://ejemplo.test/prueba', headers: new Headers() },
      params: {},
      context: new RouterContextProvider(),
      url: new URL('https://ejemplo.test/prueba'),
      pattern: '/prueba',
    })
    const linea = JSON.parse(String(consola.mock.calls[0][0]))
    expect(linea).toMatchObject({ resultado: 'error', error: 'loader roto' })
  })

  it('registra el código HTTP de Response y data lanzados', async () => {
    const consola = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const build = {
      entry: { module: { default: () => new Response('documento'), instrumentations } },
      routes: {
        root: { id: 'root', path: '', module: { default: () => null } },
        respuesta: {
          id: 'respuesta',
          parentId: 'root',
          path: 'respuesta',
          module: { loader: () => Promise.reject(new Response(null, { status: 401 })) },
          hasLoader: true,
        },
        datos: {
          id: 'datos',
          parentId: 'root',
          path: 'datos',
          module: { loader: () => Promise.reject(data({ mensaje: 'Prohibido' }, { status: 403 })) },
          hasLoader: true,
        },
      },
      assets: { version: 'prueba', routes: {} },
      publicPath: '/',
      assetsBuildDirectory: '',
      future: {},
      ssr: true,
      isSpaMode: false,
      prerender: [],
      routeDiscovery: { mode: 'initial', manifestPath: '/__manifest' },
    } as unknown as ServerBuild
    const manejar = createRequestHandler(build, 'test')

    await expect(manejar(new Request('https://ejemplo.test/respuesta'))).resolves.toHaveProperty(
      'status',
      401,
    )
    await expect(manejar(new Request('https://ejemplo.test/datos'))).resolves.toHaveProperty('status', 403)

    const lineas = consola.mock.calls.map(([linea]) => JSON.parse(String(linea)))
    expect(lineas.filter((linea) => linea.tipo === 'peticion').map((linea) => linea.status)).toEqual([
      401, 403,
    ])
    expect(lineas.some((linea) => linea.status === 'success')).toBe(false)
  })

  it('el Dockerfile usa node, no copia .env y hay instrumentación', async () => {
    const dockerfile = await readFile(join(process.cwd(), 'Dockerfile'), 'utf8')
    expect(dockerfile).toMatch(/^USER node$/m)
    expect(dockerfile).not.toMatch(/COPY[^\n]*\.env/)
    expect(instrumentations).toHaveLength(1)
  })

  it('docker ignora secretos, datos personales, dependencias y artefactos', async () => {
    const dockerignore = await readFile(join(process.cwd(), '.dockerignore'), 'utf8')
    for (const entrada of ['.env', 'datos/', 'subidas/', 'node_modules', 'build', '.react-router'])
      expect(dockerignore).toContain(entrada)
  })
})
