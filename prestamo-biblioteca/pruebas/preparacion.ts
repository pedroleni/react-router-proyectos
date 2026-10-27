import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach } from 'vitest'
import { cerrar, prepararRed } from './ayudas'

beforeEach(prepararRed)
afterEach(cerrar)
