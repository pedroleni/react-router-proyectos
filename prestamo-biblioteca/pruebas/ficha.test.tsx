import { screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { abrir, fallar } from './ayudas'

describe('La ficha de un libro', () => {
  test('enseña el libro y el estado de cada ejemplar', async () => {
    await abrir('/catalogo/3')
    expect(await screen.findByRole('heading', { level: 1, name: 'Marianela' })).toBeInTheDocument()
    expect(screen.getByText('Benito Pérez Galdós')).toBeInTheDocument()
    expect(screen.getByText('3 de 4 ejemplares')).toBeInTheDocument()
    expect((await screen.findByText('MAR-01')).closest('li')).toHaveTextContent('prestado hasta el 19 de octubre')
    expect(screen.getByText('MAR-02').closest('li')).toHaveTextContent('disponible')
  })

  test('un libro que no existe tiene su propia página', async () => {
    await abrir('/catalogo/99')
    expect(await screen.findByRole('heading', { name: 'No hemos encontrado ese libro' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al catálogo' })).toBeInTheDocument()
  })

  test('si el libro no carga, lo dice y deja el menú', async () => {
    fallar('GET /api/libros/3')
    await abrir('/catalogo/3')
    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido cargar el libro.')
    expect(screen.getByRole('link', { name: 'Catálogo' })).toBeInTheDocument()
  })

  test('si solo fallan los ejemplares, el libro se ve igual', async () => {
    fallar('GET /api/libros/3/ejemplares')
    await abrir('/catalogo/3')
    expect(await screen.findByRole('heading', { level: 1, name: 'Marianela' })).toBeInTheDocument()
    expect(await screen.findByRole('alert')).toHaveTextContent('No se han podido cargar los ejemplares.')
  })
})
