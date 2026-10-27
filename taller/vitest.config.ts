import { defineConfig } from 'vitest/config'

// Vitest no usa el plugin de React Router: las pruebas llaman a los módulos
// de ruta y a sus componentes directamente.
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
