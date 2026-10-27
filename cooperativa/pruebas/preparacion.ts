import '@testing-library/jest-dom/vitest'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

// Cada test guarda sus pedidos en un archivo nuevo: no se pisan entre sí ni
// tocan los de datos/ que se guardan al probar el proyecto en el navegador.
beforeEach(() => {
  process.env.ARCHIVO_PEDIDOS = join(tmpdir(), `cooperativa-pedidos-${randomUUID()}.json`)
})

afterEach(() => {
  cleanup()
  document.head.innerHTML = ''
})
