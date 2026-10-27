import { describe, expect, it } from 'vitest'
import { action as entrar } from '~/routes/entrar'
import { action as salir } from '~/routes/salir'
import { leerSesion } from '~/sesiones.server'
import { argumentos, cookieDe, envio, PILAR, respuesta } from './peticion'

type ArgsEntrar = Parameters<typeof entrar>[0]
type ArgsSalir = Parameters<typeof salir>[0]

const BUENAS = { correo: 'pilar@huertadelebro.example', clave: 'borraja2026', volver: '/socio' }

async function entrarComoPilar() {
  return respuesta(await entrar(argumentos<ArgsEntrar>('/entrar', { init: envio(BUENAS) })))
}

describe('Paso 1: iniciar sesión con una cookie firmada', () => {
  it('con el correo y la contraseña buenos, redirige a la zona y deja una cookie de sesión', async () => {
    const entrada = await entrarComoPilar()
    expect(entrada.status).toBe(302)
    expect(entrada.headers.get('Location')).toBe('/socio')

    const setCookie = entrada.headers.get('Set-Cookie') ?? ''
    expect(setCookie).toMatch(/^__sesion=/)
    expect(setCookie).toContain('HttpOnly')
    expect(setCookie).toContain('SameSite=Lax')
    expect(setCookie).toContain('Path=/')
    expect(setCookie).toContain('Max-Age=1209600')

    // Con esa cookie, la siguiente petición trae la sesión de Pilar.
    const sesion = await leerSesion(new Request('http://localhost/', { headers: { Cookie: cookieDe(setCookie) } }))
    expect(sesion.get('socioId')).toBe(PILAR)
  })

  it('con una contraseña mala, responde 400 con un error y el correo, y sin cookie', async () => {
    const resultado = await entrar(argumentos<ArgsEntrar>('/entrar', { init: envio({ ...BUENAS, clave: 'acelga' }) }))
    expect(resultado).toMatchObject({
      data: { error: 'El correo o la contraseña no son correctos.', correo: BUENAS.correo },
      init: { status: 400 },
    })
  })

  it('una cookie cambiada a mano no vale: la firma ya no cuadra y la sesión llega vacía', async () => {
    const cookie = cookieDe((await entrarComoPilar()).headers.get('Set-Cookie'))
    // La cookie es «__sesion=<datos en base64>.<firma>»: cambiamos los datos y dejamos la firma.
    const valor = decodeURIComponent(cookie.slice('__sesion='.length))
    const punto = valor.lastIndexOf('.')
    const datos = JSON.parse(atob(valor.slice(0, punto)))
    expect(datos.socioId).toBe(PILAR)
    const cambiados = btoa(JSON.stringify({ ...datos, socioId: 'S-0007' }))
    const falsa = `__sesion=${encodeURIComponent(`${cambiados}${valor.slice(punto)}`)}`

    const sesion = await leerSesion(new Request('http://localhost/', { headers: { Cookie: falsa } }))
    expect(sesion.get('socioId')).toBeUndefined()
  })

  it('salir borra la cookie y lleva al inicio', async () => {
    const cookie = cookieDe((await entrarComoPilar()).headers.get('Set-Cookie'))
    const salida = await salir(argumentos<ArgsSalir>('/salir', { init: { method: 'POST', headers: { Cookie: cookie } } }))
    expect(salida.status).toBe(302)
    expect(salida.headers.get('Location')).toBe('/')
    expect(salida.headers.get('Set-Cookie')).toMatch(/^__sesion=;.*Expires=Thu, 01 Jan 1970/)
  })
})
