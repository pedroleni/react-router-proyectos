import { renderToString } from 'react-dom/server'
import { createRoutesStub, matchRoutes, type RouteObject } from 'react-router'
import { describe, expect, it } from 'vitest'
import rutas from '~/routes'
import { Layout } from '~/root'
import { loader as noEncontrada } from '~/routes/no-encontrada'

describe('lección 14: anatomía', () => {
  it('cuelga las rutas públicas de un layout', () => {
    const publico = rutas[0]
    expect(publico.file).toBe('routes/publico.tsx')
    expect(publico.children?.map((ruta) => [ruta.path, ruta.file])).toEqual([
      [undefined, 'routes/portada.tsx'],
      ['albergue', 'routes/albergue.tsx'],
      ['etapas', 'routes/etapas.tsx'],
      ['etapas/:etapa', 'routes/etapa.tsx'],
      ['camas', 'routes/camas.tsx'],
      ['reservar', 'routes/reservar.tsx'],
      ['mi-camino', 'routes/mi-camino.tsx'],
    ])
  })

  it('la ruta comodín responde con un 404 HTTP real', () => {
    const resultado = noEncontrada() as unknown as { init: ResponseInit }
    expect(resultado.init.status).toBe(404)
  })

  it('agrupa las rutas de hospitaleros bajo su layout', () => {
    const zona = rutas.find((ruta) => ruta.path === 'hospitaleros')
    expect(zona?.file).toBe('routes/hospitaleros/zona.tsx')
    expect(zona?.children?.map((ruta) => ruta.file)).toEqual([
      'routes/hospitaleros/hoy.tsx',
      'routes/hospitaleros/reserva.tsx',
      'routes/hospitaleros/pernoctas-csv.ts',
    ])
  })

  it('reconoce una etapa dinámica y la ruta comodín', () => {
    const etapa = matchRoutes(rutas as RouteObject[], '/etapas/carrion-de-los-condes-terradillos')
    expect(etapa?.at(-1)?.params.etapa).toBe('carrion-de-los-condes-terradillos')
    expect((etapa?.at(-1)?.route as { file?: string }).file).toBe('routes/etapa.tsx')
    const perdida = matchRoutes(rutas as RouteObject[], '/no/existe')
    expect((perdida?.at(-1)?.route as { file?: string }).file).toBe('routes/no-encontrada.tsx')

    const comodin = rutas.find((ruta) => ruta.path === '*')
    const comodinPrimero = [comodin, ...rutas.filter((ruta) => ruta !== comodin)] as RouteObject[]
    const etapaReordenada = matchRoutes(comodinPrimero, '/etapas/carrion-de-los-condes-terradillos')
    expect((etapaReordenada?.at(-1)?.route as { file?: string }).file).toBe('routes/etapa.tsx')
  })

  it('declara el idioma del documento completo', () => {
    const Stub = createRoutesStub([
      {
        path: '/',
        Component: () => (
          <Layout>
            <p>Prueba</p>
          </Layout>
        ),
      },
    ])
    const html = renderToString(<Stub initialEntries={['/']} />)
    expect(html).toContain('<html lang="es"')
  })
})
