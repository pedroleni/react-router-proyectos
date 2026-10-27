import { describe, expect, it } from 'vitest'
import { secretosDeSesion } from '~/config.server'
import { crearAlmacenDeSesiones } from '~/sesiones.server'

describe('Paso 10: el secreto de la sesión, desde el entorno', () => {
  it('en desarrollo, sin SECRETO_SESION, usa uno de desarrollo', () => {
    expect(secretosDeSesion({ NODE_ENV: 'development' })).toEqual(['solo-para-desarrollo-no-lo-uses-en-produccion'])
  })

  it('en producción, sin SECRETO_SESION, se niega a arrancar', () => {
    expect(() => secretosDeSesion({ NODE_ENV: 'production' })).toThrow(
      'Falta la variable de entorno SECRETO_SESION: sin ella no se pueden firmar las cookies de sesión.',
    )
  })

  it('SECRETO_SESION admite varios secretos separados por comas, para rotarlos', () => {
    expect(secretosDeSesion({ NODE_ENV: 'production', SECRETO_SESION: 'nuevo-2026-11, viejo-2026-10' })).toEqual([
      'nuevo-2026-11',
      'viejo-2026-10',
    ])
  })

  it('al rotar, las cookies firmadas con el secreto viejo siguen valiendo', async () => {
    const antes = crearAlmacenDeSesiones(['viejo-2026-10'])
    const despues = crearAlmacenDeSesiones(['nuevo-2026-11', 'viejo-2026-10'])
    const otro = crearAlmacenDeSesiones(['nuevo-2026-11'])

    const sesion = await antes.getSession()
    sesion.set('socioId', 'S-0142')
    const cookie = (await antes.commitSession(sesion)).split(';')[0]

    expect((await despues.getSession(cookie)).get('socioId')).toBe('S-0142')
    expect((await otro.getSession(cookie)).get('socioId')).toBeUndefined()
  })
})
