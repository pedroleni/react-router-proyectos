import { describe, expect, it, vi } from 'vitest'
import { ETAPAS } from '~/datos/etapas'
import { comprobarCredenciales } from '~/datos/hospitaleros.server'
import { hoyEnSahagun } from '~/fechas'
import { loader as camas } from '~/routes/camas'
import { action as reservar } from '~/routes/reservar'
import { argumentos, envio } from './peticion'

function estado(valor: unknown): number | undefined {
  if (valor instanceof Response) return valor.status
  return (valor as { init?: ResponseInit }).init?.status
}

describe('datos de partida', () => {
  it('incluye las cinco etapas aproximadas alrededor de Sahagún', () => {
    expect(ETAPAS).toHaveLength(5)
    expect(ETAPAS.every((etapa) => etapa.kilometros > 0)).toBe(true)
  })

  it('solo acepta las contraseñas de ejemplo correctas', async () => {
    await expect(comprobarCredenciales('marta', 'camino2026')).resolves.toMatchObject({
      nombre: 'Marta Díez',
    })
    await expect(comprobarCredenciales('marta', 'otra')).resolves.toBeNull()
  })

  it('calcula hoy en Sahagún y no en UTC', () => {
    expect(hoyEnSahagun(new Date('2026-07-15T00:30:00+02:00'))).toBe('2026-07-15')
  })

  it('camas rechaza texto y fechas inexistentes con 400', async () => {
    for (const noche of ['foo', '2026-02-30']) {
      const resultado = await camas(
        argumentos<Parameters<typeof camas>[0]>(`/camas?noche=${encodeURIComponent(noche)}`),
      ).catch((error) => error)
      expect(estado(resultado)).toBe(400)
    }
  })

  it('valida nombre, documento, pasado y temporada por campo', async () => {
    vi.useFakeTimers()
    try {
      vi.setSystemTime(new Date('2026-07-15T00:30:00+02:00'))
      const resultado = (await reservar(
        argumentos<Parameters<typeof reservar>[0]>('/reservar', {
          init: envio({
            nombre: 'N'.repeat(81),
            documento: 'abc',
            noche: '2026-11-01',
            personas: '7',
          }),
        }),
      )) as unknown as { init: ResponseInit; data: { errores: Record<string, string[]> } }
      expect(resultado.init.status).toBe(400)
      expect(resultado.data.errores).toMatchObject({
        nombre: expect.any(Array),
        documento: expect.any(Array),
        noche: expect.any(Array),
        personas: expect.any(Array),
      })
      const pasada = (await reservar(
        argumentos<Parameters<typeof reservar>[0]>('/reservar', {
          init: envio({ nombre: 'Rita', documento: '123', noche: '2026-07-14', personas: '1' }),
        }),
      )) as unknown as { data: { errores: Record<string, string[]> } }
      expect(pasada.data.errores.noche.join(' ')).toMatch(/pasado/i)
    } finally {
      vi.useRealTimers()
    }
  })
})
