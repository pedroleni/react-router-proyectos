import { randomBytes, scrypt } from 'node:crypto'
import { promisify } from 'node:util'

const clave = process.argv[2]
if (!clave) {
  console.error('Uso: node scripts/crear-hospitalero.mjs <contraseña>')
  process.exit(1)
}

const sal = randomBytes(16).toString('hex')
const hash = await promisify(scrypt)(clave, sal, 32)
console.log(JSON.stringify({ sal, hash: Buffer.from(hash).toString('hex') }, null, 2))

