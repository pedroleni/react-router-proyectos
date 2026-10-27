import { describe, expect, it } from 'vitest'
import type { Config } from '@react-router/dev/config'
import configuracion from '../react-router.config'
import { headers } from '~/routes/catalogo'

type ArgsHeaders = Parameters<typeof headers>[0]
const config: Config = configuracion

describe('Paso 6: páginas prerenderizadas y caché en el catálogo', () => {
  it('se prerenderizan la portada y «Cómo funciona», y nada de la zona de socios', () => {
    expect(config.prerender).toEqual(['/', '/como-funciona'])
  })

  it('el catálogo se puede guardar en el navegador y en una caché compartida', () => {
    const cabeceras = new Headers(headers({} as ArgsHeaders))
    const cacheControl = cabeceras.get('Cache-Control') ?? ''
    expect(cacheControl).toMatch(/\bpublic\b/)
    expect(cacheControl).toMatch(/\bmax-age=\d+/)
    expect(cacheControl).toMatch(/\bs-maxage=\d+/)
  })
})
