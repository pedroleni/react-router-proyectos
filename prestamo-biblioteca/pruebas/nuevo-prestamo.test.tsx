import { screen, waitFor, within } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { abrir, entrarComo, ruta } from './ayudas'

describe('Un préstamo nuevo', () => {
  test('se llega desde la lista de préstamos', async () => {
    entrarComo()
    const usuario = await abrir('/prestamos')
    await usuario.click(await screen.findByRole('link', { name: 'Nuevo préstamo' }))
    expect(await screen.findByRole('heading', { name: 'Nuevo préstamo' })).toBeInTheDocument()
    expect(ruta()).toBe('/prestamos/nuevo')
  })

  test('se registra y aparece en la lista', async () => {
    entrarComo()
    const usuario = await abrir('/prestamos/nuevo')
    await usuario.selectOptions(await screen.findByLabelText('Alumno o alumna'), 'Nerea Soto (4.º ESO B)')
    await usuario.selectOptions(await screen.findByLabelText('Libro'), 'El camino (4 disponibles)')
    await usuario.selectOptions(screen.getByLabelText('Plazo'), '21 días')
    await usuario.click(screen.getByRole('button', { name: 'Registrar el préstamo' }))
    expect(await screen.findByRole('heading', { name: 'Préstamos activos' })).toBeInTheDocument()
    expect(ruta()).toBe('/prestamos')
    expect(await screen.findByText('10 préstamos activos · 2 vencidos')).toBeInTheDocument()
    const fila = screen.getByText('El camino', { selector: '.prestamo-titulo' }).closest('li')
    expect(fila).toHaveTextContent('Nerea Soto (4.º ESO B)')
    expect(fila).toHaveTextContent('CAM-01 · hasta el 16 de noviembre')
  })

  test('los errores de la API salen junto a su campo', async () => {
    entrarComo()
    const usuario = await abrir('/prestamos/nuevo')
    await usuario.selectOptions(await screen.findByLabelText('Alumno o alumna'), 'Lucía Pardo (3.º ESO A)')
    await screen.findByLabelText('Libro')
    await usuario.click(screen.getByRole('button', { name: 'Registrar el préstamo' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Alumno o alumna')).toHaveAccessibleDescription(
        'Lucía Pardo ya tiene 3 libros en préstamo.',
      ),
    )
    expect(screen.getByLabelText('Libro')).toHaveAccessibleDescription('Elige un libro.')
    expect(ruta()).toBe('/prestamos/nuevo')
  })

  test('solo ofrece libros con algún ejemplar libre', async () => {
    entrarComo()
    await abrir('/prestamos/nuevo')
    const libros = await screen.findByLabelText('Libro')
    expect(within(libros).getByRole('option', { name: 'Marianela (3 disponibles)' })).toBeInTheDocument()
    expect(within(libros).queryByRole('option', { name: /Los santos inocentes/ })).not.toBeInTheDocument()
  })
})
