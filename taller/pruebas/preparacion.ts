import '@testing-library/jest-dom/vitest'
import { randomUUID } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

// Cada prueba recibe almacenes propios: no se pisan entre sí ni tocan los
// archivos que usa la aplicación al ejecutarse en el navegador.
beforeEach(() => {
  if (typeof localStorage !== 'undefined') localStorage.clear()
  const sufijo = randomUUID()
  process.env.ARCHIVO_RESERVAS = join(tmpdir(), `el-cea-reservas-${sufijo}.json`)
  process.env.ARCHIVO_AVISOS = join(tmpdir(), `el-cea-avisos-${sufijo}.json`)
  process.env.DIRECTORIO_SUBIDAS = join(tmpdir(), `el-cea-subidas-${sufijo}`)
  process.env.NODE_ENV = 'test'
  delete process.env.AVISOS_TOKEN
  delete process.env.SECRETO_SESION
})

afterEach(() => {
  cleanup()
  if (typeof document !== 'undefined') document.head.innerHTML = ''
})
