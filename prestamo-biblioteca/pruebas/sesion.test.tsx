import { act, screen, waitFor } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { abrir, entrarComo, fallar, ruta } from './ayudas'

describe('La sesión', () => {
  test('sin sesión, los préstamos llevan a entrar, y después se vuelve', async () => {
    const usuario = await abrir('/prestamos')
    await waitFor(() => expect(ruta()).toBe('/entrar?volver=%2Fprestamos'))
    await usuario.type(await screen.findByLabelText('Usuario'), 'marta')
    await usuario.type(screen.getByLabelText('Contraseña'), 'tierrasaltas')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('heading', { name: 'Préstamos activos' })).toBeInTheDocument()
    expect(ruta()).toBe('/prestamos')
    expect(screen.getByText('Marta Gil')).toBeInTheDocument()
  })

  test('vuelve a la dirección exacta que se pidió', async () => {
    const usuario = await abrir('/prestamos/nuevo')
    await waitFor(() => expect(ruta()).toBe('/entrar?volver=%2Fprestamos%2Fnuevo'))
    await usuario.type(await screen.findByLabelText('Usuario'), 'marta')
    await usuario.type(screen.getByLabelText('Contraseña'), 'tierrasaltas')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('heading', { name: 'Nuevo préstamo' })).toBeInTheDocument()
    expect(ruta()).toBe('/prestamos/nuevo')
  })

  test('una contraseña incorrecta se queda en la página, con un aviso', async () => {
    const usuario = await abrir('/entrar')
    await usuario.type(await screen.findByLabelText('Usuario'), 'marta')
    await usuario.type(screen.getByLabelText('Contraseña'), 'otra')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario o contraseña incorrectos.')
    expect(ruta()).toBe('/entrar')
  })

  test('«volver» no saca de la web', async () => {
    const usuario = await abrir('/entrar?volver=https%3A%2F%2Fejemplo.com%2Frobar')
    await usuario.type(await screen.findByLabelText('Usuario'), 'marta')
    await usuario.type(screen.getByLabelText('Contraseña'), 'tierrasaltas')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('heading', { name: 'Préstamos activos' })).toBeInTheDocument()
    expect(ruta()).toBe('/prestamos')
  })

  test('un «volver» mal formado lleva a los préstamos', async () => {
    const usuario = await abrir('/entrar?volver=http%3A%2F%2F%5B')
    await usuario.type(await screen.findByLabelText('Usuario'), 'marta')
    await usuario.type(screen.getByLabelText('Contraseña'), 'tierrasaltas')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('heading', { name: 'Préstamos activos' })).toBeInTheDocument()
    expect(ruta()).toBe('/prestamos')
  })

  test('después de entrar, Atrás no vuelve al formulario', async () => {
    const usuario = await abrir('/catalogo')
    await usuario.click(await screen.findByRole('link', { name: 'Préstamos' }))
    await waitFor(() => expect(ruta()).toBe('/entrar?volver=%2Fprestamos'))
    await usuario.type(await screen.findByLabelText('Usuario'), 'marta')
    await usuario.type(screen.getByLabelText('Contraseña'), 'tierrasaltas')
    await usuario.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('heading', { name: 'Préstamos activos' })).toBeInTheDocument()
    act(() => window.history.back())
    await waitFor(() => expect(ruta()).toBe('/catalogo'))
    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument()
  })

  test('con sesión, la cabecera dice quién ha entrado', async () => {
    entrarComo()
    await abrir('/catalogo')
    expect(await screen.findByText('Marta Gil')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
  })

  test('si cerrar sesión falla, la sesión sigue abierta', async () => {
    entrarComo()
    const usuario = await abrir('/prestamos')
    await screen.findByRole('heading', { name: 'Préstamos activos' })
    fallar('DELETE /api/sesion', 1)
    await usuario.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se ha podido cerrar la sesión.')
    expect(screen.getByText('Marta Gil')).toBeInTheDocument()
    await usuario.click(screen.getByRole('link', { name: 'Préstamos' }))
    expect(await screen.findByRole('heading', { name: 'Préstamos activos' })).toBeInTheDocument()
  })

  test('cerrar sesión lleva al catálogo y vuelve a cerrar los préstamos', async () => {
    entrarComo()
    const usuario = await abrir('/prestamos')
    await screen.findByRole('heading', { name: 'Préstamos activos' })
    await usuario.click(screen.getByRole('button', { name: 'Cerrar sesión' }))
    await waitFor(() => expect(ruta()).toBe('/catalogo'))
    expect(await screen.findByRole('link', { name: 'Entrar' })).toBeInTheDocument()
    await usuario.click(screen.getByRole('link', { name: 'Préstamos' }))
    await waitFor(() => expect(ruta()).toBe('/entrar?volver=%2Fprestamos'))
  })
})
