import { renderToString } from 'react-dom/server'
import { MemoryRouter, RouterContextProvider, href } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { hospitaleroContext } from '~/contexto.server'
import { clientLoader, ErrorBoundary, loader } from '~/routes/etapa'
import { argumentos } from './peticion'

describe('lección 15: tipos de punta a punta', () => {
  it('lanza un 404 cuando la etapa no existe', async () => {
    const lanzado = await loader(
      argumentos<Parameters<typeof loader>[0]>('/etapas/inventada', { params: { etapa: 'inventada' } }),
    ).catch((error) => error)
    expect(lanzado.init.status).toBe(404)

    const serverLoader = vi.fn().mockResolvedValue({ etapa: { slug: 'sahagun' } })
    await expect(clientLoader({ params: { etapa: 'sahagun' }, serverLoader } as never)).resolves.toEqual({
      etapa: { slug: 'sahagun' },
    })
    expect(serverLoader).toHaveBeenCalledOnce()
  })

  it('pinta el mensaje validado del error de ruta', () => {
    const error = {
      status: 404,
      statusText: 'Not Found',
      internal: false,
      data: { mensaje: 'Etapa ausente.' },
    }
    expect(
      renderToString(
        <MemoryRouter>
          <ErrorBoundary error={error as never} params={{ etapa: 'ausente' }} />
        </MemoryRouter>,
      ),
    ).toContain('Etapa ausente.')
  })

  it('usa un mensaje genérico si los datos del error no cuadran', () => {
    const error = { status: 404, statusText: 'Not Found', internal: false, data: { otro: true } }
    expect(
      renderToString(
        <MemoryRouter>
          <ErrorBoundary error={error as never} params={{ etapa: 'ausente' }} />
        </MemoryRouter>,
      ),
    ).toContain('No hemos podido mostrar esta etapa.')
  })

  it('no presenta como etapa ausente un error que no sea 404', () => {
    const html = renderToString(
      <MemoryRouter>
        <ErrorBoundary error={new Error('fallo interno')} params={{ etapa: 'sahagun' }} />
      </MemoryRouter>,
    )
    expect(html).toContain('<h1>Error al mostrar la etapa</h1>')
    expect(html).not.toContain('<h1>Etapa no encontrada</h1>')
  })

  it('tipa enlaces dinámicos y contextos sin valor por defecto', () => {
    expect(href('/etapas/:etapa', { etapa: 'sahagun-el-burgo-ranero' })).toBe(
      '/etapas/sahagun-el-burgo-ranero',
    )
    expect(() => new RouterContextProvider().get(hospitaleroContext)).toThrow('No value found for context')
  })
})
