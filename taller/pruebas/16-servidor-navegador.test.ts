import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import * as moduloEtapa from '~/routes/etapa'
import { clientLoader as cargarMiCamino } from '~/routes/mi-camino'
import { actualizarReserva, buscarReserva, camasLibres, guardarReserva } from '~/datos/reservas.server'
import { clientMiddleware } from '~/medir.client'
import { clientMiddleware as middlewareRaiz } from '~/root'
import { action as reservar } from '~/routes/reservar'
import { argumentos, envio } from './peticion'

function estado(valor: unknown): number | undefined {
  if (valor instanceof Response) return valor.status
  return (valor as { init?: ResponseInit }).init?.status
}

describe('lección 16: servidor y navegador', () => {
  it('reutiliza durante cinco minutos el resultado del loader del servidor', async () => {
    const serverLoader = vi.fn().mockResolvedValue({ etapa: { slug: 'cache-uno' } })
    const args = { params: { etapa: 'cache-uno' }, serverLoader }
    await moduloEtapa.clientLoader(args as never)
    await moduloEtapa.clientLoader(args as never)
    expect(serverLoader).toHaveBeenCalledTimes(1)
  })

  it('vuelve al servidor cuando la caché ha caducado', async () => {
    vi.useFakeTimers()
    try {
      const serverLoader = vi.fn().mockResolvedValue({ etapa: { slug: 'cache-dos' } })
      const args = { params: { etapa: 'cache-dos' }, serverLoader }
      await moduloEtapa.clientLoader(args as never)
      vi.advanceTimersByTime(60 * 1000 + 1)
      await moduloEtapa.clientLoader(args as never)
      expect(serverLoader).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(5 * 60 * 1000 + 1)
      await moduloEtapa.clientLoader(args as never)
      expect(serverLoader).toHaveBeenCalledTimes(2)
    } finally {
      vi.useRealTimers()
    }
  })

  it('mantiene los datos SSR de una etapa mientras ceba la caché del navegador', () => {
    expect('HydrateFallback' in moduloEtapa).toBe(false)
    expect(moduloEtapa.clientLoader.hydrate).toBe(true)
    const html = renderToString(
      createElement(
        MemoryRouter,
        {},
        createElement(moduloEtapa.default, {
          loaderData: {
            etapa: {
              slug: 'prueba',
              origen: 'Sahagún',
              destino: 'El Burgo Ranero',
              kilometros: 17.9,
              descripcion: 'Etapa de prueba.',
            },
          },
        } as never),
      ),
    )
    expect(html).toContain('<h1>')
    expect(html).toContain('Sahagún')
    expect(html).toMatch(/17,9.*km/)
  })

  it('mi camino lee localStorage, ignora slugs desconocidos y tolera JSON roto', async () => {
    localStorage.setItem('el-cea:mi-camino', JSON.stringify(['sahagun-el-burgo-ranero', 'inventada']))
    await expect(cargarMiCamino()).resolves.toMatchObject({
      etapas: [{ slug: 'sahagun-el-burgo-ranero' }],
    })
    localStorage.setItem('el-cea:mi-camino', '{roto')
    await expect(cargarMiCamino()).resolves.toEqual({ etapas: [] })
  })

  it('mezcla dentro de la cola dos cambios simultáneos sobre la misma reserva', async () => {
    await guardarReserva({
      id: 'mezcla',
      noche: '2031-06-02',
      nombre: 'Lina Ko',
      documento: '***111',
      personas: 1,
      estado: 'reservada',
      credencial: null,
    })
    await Promise.all([
      actualizarReserva('mezcla', { estado: 'llegada' }),
      actualizarReserva('mezcla', { credencial: 'foto.png' }),
    ])
    await expect(buscarReserva('mezcla')).resolves.toMatchObject({
      estado: 'llegada',
      credencial: 'foto.png',
    })
  })

  it('mantiene un JSON válido con dos escrituras simultáneas', async () => {
    await Promise.all([
      guardarReserva({
        id: 'par-a',
        noche: '2026-06-01',
        nombre: 'Lina Ko',
        documento: '***111',
        personas: 1,
        estado: 'reservada',
        credencial: null,
      }),
      guardarReserva({
        id: 'par-b',
        noche: '2026-06-02',
        nombre: 'Moussa Diallo',
        documento: '***222',
        personas: 1,
        estado: 'reservada',
        credencial: null,
      }),
    ])
    const datos = JSON.parse(await readFile(process.env.ARCHIVO_RESERVAS!, 'utf8')) as { id: string }[]
    expect(datos.map((reserva) => reserva.id)).toEqual(expect.arrayContaining(['par-a', 'par-b']))
  })

  it('serializa la comprobación de camas y evita sobreventa', async () => {
    const resultados = await Promise.all(
      Array.from({ length: 6 }, (_, indice) =>
        reservar(
          argumentos<Parameters<typeof reservar>[0]>('/reservar', {
            init: envio({
              nombre: `Grupo ${indice}`,
              documento: String(100 + indice),
              noche: '2031-06-10',
              personas: '6',
            }),
          }),
        ),
      ),
    )
    expect(resultados.filter((resultado) => estado(resultado) === 201)).toHaveLength(4)
    expect(resultados.filter((resultado) => estado(resultado) === 409)).toHaveLength(2)
    expect(await camasLibres('2031-06-10')).toBe(0)
  })

  it('el middleware cliente devuelve exactamente lo que devuelve next', async () => {
    vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    const resultado = {}
    await expect(clientMiddleware({} as never, async () => resultado)).resolves.toBe(resultado)
  })

  it('instala el middleware de cliente en la raíz', () => {
    expect(middlewareRaiz).toHaveLength(1)
  })
})
