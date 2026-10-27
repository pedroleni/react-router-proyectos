import { screen } from '@testing-library/react'
import { expect, test } from 'vitest'
import { abrir } from './ayudas'

test('una dirección que no existe tiene su página', async () => {
  await abrir('/lo-que-sea')
  expect(await screen.findByRole('heading', { name: 'Esta página no existe' })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Ir al catálogo' })).toBeInTheDocument()
})
