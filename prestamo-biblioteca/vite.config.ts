import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { apiBiblioteca } from './servidor/plugin.ts'

export default defineConfig({
  plugins: [react(), apiBiblioteca()],
})
