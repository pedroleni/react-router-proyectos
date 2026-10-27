import { screen, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { abrir, entrarComo, fallar } from './ayudas'

function fila(titulo: string) {
  return screen.getByText(titulo, { selector: '.prestamo-titulo' }).closest('li')
}

describe('Los préstamos', () => {
  test('lista los préstamos activos, por fecha, y marca los vencidos', async () => {
    entrarComo()
    await abrir('/prestamos')
    expect(await screen.findByRole('heading', { name: 'Préstamos activos' })).toBeInTheDocument()
    expect(screen.getByText('9 préstamos activos · 2 vencidos')).toBeInTheDocument()
    const filas = screen.getAllByRole('listitem')
    expect(filas).toHaveLength(9)
    expect(filas[0]).toHaveTextContent('Marianela')
    expect(fila('Marianela')).toHaveTextContent('Lucía Pardo (3.º ESO A)')
    expect(fila('Marianela')).toHaveTextContent('hasta el 19 de octubre')
    expect(fila('Marianela')).toHaveTextContent('Vencido')
    expect(fila('Luces de bohemia')).toHaveTextContent('Vencido')
    expect(fila('Platero y yo')).not.toHaveTextContent('Vencido')
  })

  test('devolver un libro lo quita de la lista y lo deja disponible', async () => {
    entrarComo()
    const usuario = await abrir('/prestamos')
    await usuario.click(await screen.findByRole('button', { name: 'Devolver «Marianela», de Lucía Pardo' }))
    expect(await screen.findByText('8 préstamos activos · 1 vencidos')).toBeInTheDocument()
    expect(screen.queryByText('Marianela', { selector: '.prestamo-titulo' })).not.toBeInTheDocument()
    await usuario.click(screen.getByRole('link', { name: 'Catálogo' }))
    const marianela = await screen.findByRole('link', { name: 'Marianela' })
    await waitFor(() => expect(marianela.closest('li')).toHaveTextContent('4 de 4 disponibles'))
  })

  test('si los préstamos no cargan, lo dice y deja el menú', async () => {
    entrarComo()
    fallar('GET /api/prestamos')
    await abrir('/prestamos')
    expect(await screen.findByRole('alert')).toHaveTextContent('No se han podido cargar los préstamos.')
    expect(screen.getByRole('link', { name: 'Catálogo' })).toBeInTheDocument()
  })
})
