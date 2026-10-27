import { screen, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { abrir, fallar, ruta } from './ayudas'

function titulos() {
  return screen.getAllByRole('listitem').map((elemento) => elemento.querySelector('a')?.textContent)
}

describe('El catálogo', () => {
  test('la dirección raíz lleva al catálogo', async () => {
    await abrir('/')
    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument()
    expect(ruta()).toBe('/catalogo')
  })

  test('enseña cada libro con sus ejemplares disponibles', async () => {
    await abrir('/catalogo')
    const marianela = await screen.findByRole('link', { name: 'Marianela' })
    expect(screen.getAllByRole('listitem')).toHaveLength(12)
    expect(marianela.closest('li')).toHaveTextContent('Benito Pérez Galdós')
    expect(marianela.closest('li')).toHaveTextContent('3 de 4 disponibles')
    expect(screen.getByRole('link', { name: 'Los santos inocentes' }).closest('li')).toHaveTextContent(
      '0 de 2 disponibles',
    )
  })

  test('buscar deja la búsqueda en la URL y filtra la lista', async () => {
    const usuario = await abrir('/catalogo')
    await screen.findByRole('link', { name: 'Marianela' })
    await usuario.type(screen.getByLabelText('Título o autor'), 'delibes')
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }))
    await waitFor(() => expect(ruta()).toBe('/catalogo?q=delibes'))
    await waitFor(() => expect(screen.queryByRole('link', { name: 'Marianela' })).not.toBeInTheDocument())
    expect(titulos()).toEqual(['El camino', 'Los santos inocentes'])
  })

  test('la búsqueda no tiene en cuenta los espacios de los lados', async () => {
    const usuario = await abrir('/catalogo')
    await screen.findByRole('link', { name: 'Marianela' })
    await usuario.type(screen.getByLabelText('Título o autor'), '  delibes ')
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }))
    await waitFor(() => expect(ruta()).toBe('/catalogo?q=delibes'))
    await waitFor(() => expect(titulos()).toEqual(['El camino', 'Los santos inocentes']))
  })

  test('buscar sin texto vuelve al catálogo entero', async () => {
    const usuario = await abrir('/catalogo?q=lorca')
    await screen.findByRole('link', { name: 'La casa de Bernarda Alba' })
    await usuario.clear(screen.getByLabelText('Título o autor'))
    await usuario.click(screen.getByRole('button', { name: 'Buscar' }))
    await waitFor(() => expect(ruta()).toBe('/catalogo'))
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(12))
  })

  test('una búsqueda en la URL llega filtrada y con el campo relleno', async () => {
    await abrir('/catalogo?q=becquer')
    expect(await screen.findByRole('link', { name: 'Rimas y leyendas' })).toBeInTheDocument()
    expect(titulos()).toEqual(['Rimas y leyendas'])
    expect(screen.getByLabelText('Título o autor')).toHaveValue('becquer')
  })

  test('sin resultados, lo dice', async () => {
    await abrir('/catalogo?q=quijote')
    expect(await screen.findByText('No hay libros que coincidan con «quijote».')).toBeInTheDocument()
  })

  test('si el catálogo no carga, lo dice y deja el menú', async () => {
    fallar('GET /api/libros')
    await abrir('/catalogo')
    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido cargar el catálogo.')
    expect(screen.getByRole('link', { name: 'Préstamos' })).toBeInTheDocument()
  })

  test('de la lista se pasa a la ficha de un libro', async () => {
    const usuario = await abrir('/catalogo')
    await usuario.click(await screen.findByRole('link', { name: 'Marianela' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Marianela' })).toBeInTheDocument()
    expect(ruta()).toBe('/catalogo/3')
  })
})
