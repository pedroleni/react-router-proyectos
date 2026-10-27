import { defineConfig } from 'vitest/config'

// Vitest, sin el plugin de React Router: los tests importan los módulos de
// ruta (sus loader, action y middleware) y los componentes directamente.
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    include: ['pruebas/**/*.test.{ts,tsx}'],
    setupFiles: ['./pruebas/preparacion.ts'],
  },
})
