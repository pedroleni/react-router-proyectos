import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const numero = process.argv[2]
if (!/^\d{2}$/.test(numero ?? '')) {
  console.error('Uso: npm run leccion -- 18')
  process.exit(1)
}

const vitest = new URL('../node_modules/vitest/vitest.mjs', import.meta.url)
const proceso = spawn(process.execPath, [fileURLToPath(vitest), 'run', `pruebas/${numero}-`], {
  stdio: 'inherit',
})
proceso.on('exit', (codigo) => process.exit(codigo ?? 1))
