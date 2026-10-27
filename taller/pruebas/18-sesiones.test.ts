import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { createRequestHandler, createRoutesStub, RouterContextProvider, type ServerBuild } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { secretosDeSesion } from '~/config.server'
import { hospitaleroContext, sesionContext } from '~/contexto.server'
import { action as entrar, loader as cargarEntrada } from '~/routes/entrar'
import Salir, * as rutaSalir from '~/routes/salir'
import { loader as hoy } from '~/routes/hospitaleros/hoy'
import { action as gestionarReserva } from '~/routes/hospitaleros/reserva'
import { middleware as middlewareZona } from '~/routes/hospitaleros/zona'
import { buscarReserva, guardarReserva } from '~/datos/reservas.server'
import { exigirHospitalero } from '~/middleware/hospitalero.server'
import { crearAlmacenDeSesiones } from '~/sesiones.server'
import { argumentos, cookieDe, envio, respuesta } from './peticion'

describe('lección 18: sesiones y cookies', () => {
  it('protege toda la zona con su middleware', () => {
    expect(middlewareZona).toHaveLength(1)
  })

  it('usa un secreto de desarrollo y exige uno en producción', () => {
    expect(secretosDeSesion({ NODE_ENV: 'development' })).toHaveLength(1)
    const nuevo = 'n'.repeat(32)
    const viejo = 'v'.repeat(32)
    expect(secretosDeSesion({ NODE_ENV: 'production', SECRETO_SESION: `${nuevo}, ${viejo}` })).toEqual([
      nuevo,
      viejo,
    ])
    expect(() => secretosDeSesion({ NODE_ENV: 'production' })).toThrow('Falta SECRETO_SESION')
    expect(() => secretosDeSesion({ NODE_ENV: 'production', SECRETO_SESION: 'demasiado-corto' })).toThrow(
      '32 caracteres'
    )
  })

  it('da el mismo 400 para usuario y contraseña incorrectos', async () => {
    const usuario = (await entrar(
      argumentos<Parameters<typeof entrar>[0]>('/entrar', {
        init: envio({ usuario: 'nadie', clave: 'camino2026', volver: '' }),
      })
    )) as unknown as { init: ResponseInit; data: { error: string } }
    const clave = (await entrar(
      argumentos<Parameters<typeof entrar>[0]>('/entrar', {
        init: envio({ usuario: 'marta', clave: 'incorrecta', volver: '' }),
      })
    )) as unknown as { init: ResponseInit; data: { error: string } }
    expect(usuario.init.status).toBe(400)
    expect(clave.init.status).toBe(400)
    expect(usuario.data.error).toBe(clave.data.error)
  })

  it('entra, respeta volver y entrega una cookie protegida', async () => {
    const valor = await entrar(
      argumentos<Parameters<typeof entrar>[0]>('/entrar', {
        init: envio({ usuario: 'marta', clave: 'camino2026', volver: '/hospitaleros/reservas/r-1' }),
      })
    )
    const redireccion = respuesta(valor)
    expect(redireccion.status).toBe(302)
    expect(redireccion.headers.get('Location')).toBe('/hospitaleros/reservas/r-1')
    expect(redireccion.headers.get('Set-Cookie')).toMatch(/__sesion=.*HttpOnly.*SameSite=Lax/i)
    const almacen = crearAlmacenDeSesiones(secretosDeSesion())
    const sesion = await almacen.getSession(cookieDe(redireccion.headers.get('Set-Cookie')))
    expect(sesion.get('inicio')).toEqual(expect.any(Number))
  })

  it.each([
    '//malo.example',
    '/.//malo.example',
    '/a/..//malo.example',
    '/%2e//malo.example',
    '/..//malo.example',
    '/%2e%2e//malo.example',
    '/\\malo.example',
    'https://malo.example',
    'javascript:alert(1)',
    '',
  ])('el destino provisional rechaza %j', async (volver) => {
    const consulta = new URLSearchParams({ volver })
    await expect(
      cargarEntrada(argumentos<Parameters<typeof cargarEntrada>[0]>(`/entrar?${consulta}`))
    ).resolves.toMatchObject({ volver: '/hospitaleros' })
  })

  it('rechaza y destruye una sesión con más de ocho horas', async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date('2026-07-15T08:00:00+02:00'))
      const almacen = crearAlmacenDeSesiones(secretosDeSesion())
      const sesion = await almacen.getSession()
      sesion.set('hospitaleroId', 'h-marta')
      sesion.set('inicio', Date.now())
      const cookie = cookieDe(await almacen.commitSession(sesion))
      vi.advanceTimersByTime(8 * 60 * 60 * 1000 + 1)
      let lanzado: Response | undefined
      try {
        await exigirHospitalero(
          argumentos<Parameters<typeof exigirHospitalero>[0]>('/hospitaleros', {
            init: { headers: { Cookie: cookie } },
          }),
          vi.fn()
        )
      } catch (error) {
        if (error instanceof Response) lanzado = error
      }
      expect(lanzado).toBeInstanceOf(Response)
      if (!lanzado) throw new Error('Se esperaba la redirección de sesión caducada.')
      expect(lanzado.status).toBe(302)
      expect(lanzado.headers.get('Location')).toBe('/entrar?volver=%2Fhospitaleros')
      expect(lanzado.headers.get('Set-Cookie')).toMatch(/Expires=Thu, 01 Jan 1970/i)
    } finally {
      vi.useRealTimers()
    }
  })

  it('guarda la sesión cuando next consume un flash', async () => {
    const almacen = crearAlmacenDeSesiones(secretosDeSesion())
    const sesion = await almacen.getSession()
    sesion.set('hospitaleroId', 'h-marta')
    sesion.set('inicio', Date.now())
    sesion.flash('aviso', 'Una vez')
    const cookie = cookieDe(await almacen.commitSession(sesion))
    const context = new RouterContextProvider()
    const respuesta = await exigirHospitalero(
      argumentos<Parameters<typeof exigirHospitalero>[0]>('/hospitaleros', {
        init: { headers: { Cookie: cookie } },
        context,
      }),
      async () => {
        context.get(sesionContext).get('aviso')
        return new Response('ok')
      }
    )
    if (!(respuesta instanceof Response)) throw new Error('Se esperaba una respuesta del middleware.')
    expect(respuesta.headers.get('Set-Cookie')).toContain('__sesion=')
  })

  it('limita la cookie a ocho horas y activa Secure en producción', async () => {
    const anterior = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      const almacen = crearAlmacenDeSesiones(['s'.repeat(32)])
      const cookie = await almacen.commitSession(await almacen.getSession())
      expect(cookie).toMatch(/Max-Age=28800/i)
      expect(cookie).toMatch(/; Secure/i)
    } finally {
      process.env.NODE_ENV = anterior
    }
  })

  it('rechaza una cookie firmada que ha sido manipulada', async () => {
    const almacen = crearAlmacenDeSesiones(['firma-prueba'])
    const sesion = await almacen.getSession()
    sesion.set('hospitaleroId', 'h-marta')
    const cookie = await almacen.commitSession(sesion)
    const trozos = cookieDe(cookie).split('=')
    const manipulada = `${trozos[0]}=${trozos[1].slice(0, -1)}x`
    expect((await almacen.getSession(manipulada)).get('hospitaleroId')).toBeUndefined()
  })

  it('acepta una cookie antigua durante la rotación de secretos', async () => {
    const viejo = crearAlmacenDeSesiones(['viejo'])
    const sesion = await viejo.getSession()
    sesion.set('hospitaleroId', 'h-ignacio')
    const cookie = cookieDe(await viejo.commitSession(sesion))
    const rotado = crearAlmacenDeSesiones(['nuevo', 'viejo'])
    expect((await rotado.getSession(cookie)).get('hospitaleroId')).toBe('h-ignacio')
  })

  it('el middleware redirige sin sesión y no llama a next', async () => {
    const next = vi.fn()
    let lanzado: Response | undefined
    try {
      await exigirHospitalero(
        argumentos<Parameters<typeof exigirHospitalero>[0]>('/hospitaleros/reservas/r-1'),
        next
      )
    } catch (error) {
      lanzado = error as Response
    }
    expect(next).not.toHaveBeenCalled()
    expect(lanzado?.status).toBe(302)
    expect(lanzado?.headers.get('Location')).toBe('/entrar?volver=%2Fhospitaleros%2Freservas%2Fr-1')
    expect(lanzado?.headers.get('Set-Cookie')).toBeNull()
  })

  it('el middleware deja al hospitalero en el contexto y el flash se consume una vez', async () => {
    const almacen = crearAlmacenDeSesiones(secretosDeSesion())
    const sesion = await almacen.getSession()
    sesion.set('hospitaleroId', 'h-marta')
    sesion.set('inicio', Date.now())
    sesion.flash('aviso', 'Llegada marcada')
    const cookie = cookieDe(await almacen.commitSession(sesion))
    const context = new RouterContextProvider()
    const args = argumentos<Parameters<typeof exigirHospitalero>[0]>('/hospitaleros', {
      init: { headers: { Cookie: cookie } },
      context,
    })
    const respuesta = await exigirHospitalero(args, async () => new Response('ok'))
    if (!(respuesta instanceof Response)) throw new Error('Se esperaba una respuesta del middleware.')
    expect(context.get(hospitaleroContext).usuario).toBe('marta')
    expect(respuesta.headers.get('Cache-Control')).toBe('private, no-store')
    const leida = await almacen.getSession(cookie)
    expect(leida.get('aviso')).toBe('Llegada marcada')
    expect(leida.get('aviso')).toBeUndefined()
  })

  it('salir devuelve una cookie que borra la sesión', async () => {
    const valor = await rutaSalir.action(
      argumentos<Parameters<typeof rutaSalir.action>[0]>('/salir', { init: { method: 'POST' } })
    )
    const redireccion = respuesta(valor)
    expect(redireccion.status).toBe(302)
    expect(redireccion.headers.get('Set-Cookie')).toMatch(/__sesion=.*Expires=Thu, 01 Jan 1970/i)
  })

  it('salir es una página de confirmación y rechaza un POST de otro origen', async () => {
    const Stub = createRoutesStub([{ path: '/salir', Component: Salir }])
    render(createElement(Stub, { initialEntries: ['/salir'] }))
    expect(screen.getByRole('heading', { name: 'Cerrar sesión' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()

    const build = {
      entry: { module: { default: () => new Response('documento') } },
      routes: {
        root: { id: 'root', path: '', module: { default: () => null } },
        salir: { id: 'salir', parentId: 'root', path: 'salir', module: rutaSalir, hasAction: true },
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
    const resultado = await manejar(
      new Request('https://albergue-el-cea.es/salir', {
        method: 'POST',
        headers: { Origin: 'https://malo.example' },
      })
    )
    expect(resultado.status).toBe(400)
  })

  it('no marca la llegada de una reserva anulada y el flash no copia el nombre', async () => {
    await guardarReserva({
      id: 'anulada',
      noche: '2031-06-10',
      nombre: 'Nombre que no debe entrar en la cookie',
      documento: '***123',
      personas: 1,
      estado: 'anulada',
      credencial: null,
    })
    const almacen = crearAlmacenDeSesiones(['prueba'])
    const context = new RouterContextProvider()
    context.set(hospitaleroContext, { id: 'h-marta', usuario: 'marta', nombre: 'Marta' })
    context.set(sesionContext, await almacen.getSession())
    const resultado = await gestionarReserva(
      argumentos<Parameters<typeof gestionarReserva>[0]>('/hospitaleros/reservas/anulada', {
        params: { id: 'anulada' },
        context,
        init: envio({ intencion: 'llegada' }),
      })
    )
    expect((resultado as { init?: ResponseInit }).init?.status).toBe(409)
    await expect(buscarReserva('anulada')).resolves.toMatchObject({ estado: 'anulada' })
  })

  it('la llegada deja un flash breve en la sesión', async () => {
    const almacen = crearAlmacenDeSesiones(['prueba'])
    const context = new RouterContextProvider()
    const sesion = await almacen.getSession()
    context.set(hospitaleroContext, { id: 'h-marta', usuario: 'marta', nombre: 'Marta' })
    context.set(sesionContext, sesion)
    const resultado = await gestionarReserva(
      argumentos<Parameters<typeof gestionarReserva>[0]>('/hospitaleros/reservas/r-1', {
        params: { id: 'r-1' },
        context,
        init: envio({ intencion: 'llegada' }),
      })
    )
    expect(respuesta(resultado).status).toBe(302)
    expect(sesion.get('aviso')).toBe('Llegada marcada.')
  })

  it('hoy usa la fecha de Sahagún y devuelve las reservas esperadas', async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date('2026-07-15T00:30:00+02:00'))
      await guardarReserva({
        id: 'hoy-sahagun',
        noche: '2026-07-15',
        nombre: 'Peregrina',
        documento: '***123',
        personas: 1,
        estado: 'reservada',
        credencial: null,
      })
      const almacen = crearAlmacenDeSesiones(['prueba'])
      const context = new RouterContextProvider()
      context.set(hospitaleroContext, { id: 'h-marta', usuario: 'marta', nombre: 'Marta' })
      context.set(sesionContext, await almacen.getSession())
      const resultado = await hoy(argumentos<Parameters<typeof hoy>[0]>('/hospitaleros', { context }))
      expect(resultado.noche).toBe('2026-07-15')
      expect(resultado.reservas).toHaveLength(4)
      expect(resultado.reservas.some((reserva) => reserva.id === 'hoy-sahagun')).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })
})
