// destinoSeguro, la función que decide adónde volver después de entrar. El
// ?volver= llega en la URL y cualquiera puede escribirlo: solo se acepta una
// dirección de esta misma web.
import { describe, expect, test } from 'vitest'
import { destinoSeguro } from '../src/destino'

const ORIGEN = 'http://localhost:3000'

describe('destinoSeguro', () => {
  test('una ruta de esta web se respeta, con su búsqueda y su almohadilla', () => {
    expect(destinoSeguro('/prestamos/nuevo?libro=3#plazo', ORIGEN)).toBe('/prestamos/nuevo?libro=3#plazo')
  })

  test('sin volver, a los préstamos', () => {
    expect(destinoSeguro(null, ORIGEN)).toBe('/prestamos')
    expect(destinoSeguro('', ORIGEN)).toBe('/prestamos')
  })

  test.each([
    'https://evil.example/robar',
    '//evil.example',
    '/\\evil.example',
    'http://[',
  ])('%s no saca de la web', (volver) => {
    expect(destinoSeguro(volver, ORIGEN)).toBe('/prestamos')
  })

  // new URL normaliza la ruta: quita . y .., y descodifica %2e. Estas cinco
  // son de nuestro origen, pero se quedan en //evil.example…, que el
  // navegador lee como otro dominio.
  test.each([
    '/.//evil.example',
    '/a/..//evil.example',
    '/%2e//evil.example',
    '/..//evil.example/x',
    '/%2e%2e//evil.example',
  ])('%s tampoco: su ruta normalizada empieza por //', (volver) => {
    expect(destinoSeguro(volver, ORIGEN)).toBe('/prestamos')
  })
})
