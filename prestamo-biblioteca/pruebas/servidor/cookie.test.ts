// @vitest-environment node
// La cookie de sesión, tal como sale del middleware de /api: un servidor
// HTTP de Node de verdad, peticiones por HTTP y «por HTTPS» (con la cabecera
// X-Forwarded-Proto que pone un proxy). Los tests de la app no la ven: usan
// la API en memoria directamente.
import { createServer, request, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { crearApi } from '../../servidor/api.ts'
import { crearMiddlewareApi } from '../../servidor/plugin.ts'

let servidor: Server
let puerto = 0

beforeEach(async () => {
  const middleware = crearMiddlewareApi(crearApi({ hoy: () => '2026-10-26' }), 0)
  servidor = createServer((peticion, respuesta) => {
    middleware(peticion, respuesta, () => {
      respuesta.statusCode = 404
      respuesta.end()
    })
  })
  await new Promise<void>((resolver) => servidor.listen(0, '127.0.0.1', resolver))
  puerto = (servidor.address() as AddressInfo).port
})

afterEach(async () => {
  vi.unstubAllEnvs()
  await new Promise((resolver) => servidor.close(resolver))
})

function pedir(metodo: string, ruta: string, cabeceras: Record<string, string> = {}, cuerpo?: unknown) {
  return new Promise<{ estado: number; cookies: string[]; cuerpo: string }>((resolver, rechazar) => {
    const texto = cuerpo === undefined ? undefined : JSON.stringify(cuerpo)
    const peticion = request(
      { host: '127.0.0.1', port: puerto, method: metodo, path: ruta, headers: { 'Content-Type': 'application/json', ...cabeceras } },
      (respuesta) => {
        let datos = ''
        respuesta.setEncoding('utf8')
        respuesta.on('data', (trozo: string) => (datos += trozo))
        respuesta.on('end', () =>
          resolver({ estado: respuesta.statusCode ?? 0, cookies: respuesta.headers['set-cookie'] ?? [], cuerpo: datos }),
        )
      },
    )
    peticion.on('error', rechazar)
    peticion.end(texto)
  })
}

const MARTA = { usuario: 'marta', clave: 'tierrasaltas' }
const HTTPS = { 'X-Forwarded-Proto': 'https' }
const UUID = '[0-9a-f-]{36}'

describe('La cookie de sesión', () => {
  test('por HTTP: sesion, HttpOnly, SameSite=Lax y Path=/, sin Secure ni Domain', async () => {
    const { cookies } = await pedir('POST', '/api/sesion', {}, MARTA)
    expect(cookies).toHaveLength(1)
    expect(cookies[0]).toMatch(new RegExp(`^sesion=${UUID}; Path=/; HttpOnly; SameSite=Lax$`))
  })

  test('por HTTPS: __Host-sesion con Secure, Path=/ y sin Domain', async () => {
    const { cookies } = await pedir('POST', '/api/sesion', HTTPS, MARTA)
    expect(cookies[0]).toMatch(new RegExp(`^__Host-sesion=${UUID}; Path=/; HttpOnly; SameSite=Lax; Secure$`))
    expect(cookies[0]).not.toMatch(/Domain=/i)
  })

  test('COOKIE_SEGURA=1 la hace segura aunque llegue por HTTP', async () => {
    vi.stubEnv('COOKIE_SEGURA', '1')
    const { cookies } = await pedir('POST', '/api/sesion', {}, MARTA)
    expect(cookies[0]).toMatch(new RegExp(`^__Host-sesion=${UUID}; Path=/; HttpOnly; SameSite=Lax; Secure$`))
  })

  test('por HTTPS, la sesión se lee con __Host-sesion y se borra con el mismo nombre', async () => {
    const entrar = await pedir('POST', '/api/sesion', HTTPS, MARTA)
    const cookie = entrar.cookies[0].split(';')[0]
    const leer = await pedir('GET', '/api/sesion', { ...HTTPS, Cookie: cookie })
    expect(JSON.parse(leer.cuerpo)).toEqual({ usuario: { usuario: 'marta', nombre: 'Marta Gil' } })
    const salir = await pedir('DELETE', '/api/sesion', { ...HTTPS, Cookie: cookie })
    expect(salir.estado).toBe(204)
    expect(salir.cookies[0]).toBe('__Host-sesion=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0')
    const despues = await pedir('GET', '/api/sesion', { ...HTTPS, Cookie: cookie })
    expect(JSON.parse(despues.cuerpo)).toEqual({ usuario: null })
  })

  test('por HTTP, salir borra la cookie sesion', async () => {
    const entrar = await pedir('POST', '/api/sesion', {}, MARTA)
    const salir = await pedir('DELETE', '/api/sesion', { Cookie: entrar.cookies[0].split(';')[0] })
    expect(salir.cookies[0]).toBe('sesion=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
  })
})
