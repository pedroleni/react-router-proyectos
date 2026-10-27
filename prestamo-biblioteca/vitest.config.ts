import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// Aparte de vite.config.ts: los tests no necesitan la API de verdad (usan un
// fetch simulado) y, si un día la app pasa al modo framework, su plugin no
// debe cargarse aquí.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./pruebas/preparacion.ts'],
    include: ['pruebas/**/*.test.{ts,tsx}'],
  },
})
