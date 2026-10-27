import { RouterContextProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import configuracion from '../react-router.config'
import { ETAPAS } from '~/datos/etapas'
import { headers as cabecerasCamas } from '~/routes/camas'
import { handleError, streamTimeout } from '~/entry.server'

describe('lección 17: estrategias de renderizado', () => {
  it('prerenderiza el albergue y cada etapa, pero no la portada ni la zona privada', async () => {
    const prerender = configuracion.prerender
    expect(prerender).toEqual(['/albergue', ...ETAPAS.map((etapa) => `/etapas/${etapa.slug}`)])
  })

  it('da a las camas una caché pública y corta', () => {
    expect(cabecerasCamas()).toEqual({
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    })
  })

  it('limita el flujo del servidor a cinco segundos', () => {
    expect(streamTimeout).toBe(5_000)
    expect(() =>
      handleError(new Error('fallo de prueba'), {
        request: new Request('https://ejemplo.test/fallo'),
        context: new RouterContextProvider(),
        params: {},
      })
    ).not.toThrow()
  })
})
