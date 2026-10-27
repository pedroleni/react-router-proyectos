// Un comportamiento nuevo del paso 3.2, que la versión 6 no tenía. No es de
// caracterización: en la 6 este test falla. Los de pruebas/ no cambian.
import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { abrir, fallar } from '../ayudas'

describe('La sesión, cuando la API falla', () => {
  test('si no se sabe quién ha entrado, lo dice y deja reintentar', async () => {
    fallar('GET /api/sesion', 1)
    const usuario = await abrir('/catalogo')
    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido abrir la biblioteca.')
    await usuario.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument()
  })
})
