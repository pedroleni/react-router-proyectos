import { scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { Hospitalero } from '~/tipos'

const derivar = promisify(scrypt) as (clave: string, sal: string, longitud: number) => Promise<Buffer>
type HospitaleroGuardado = Hospitalero & { sal: string; hash: string }

// Las contraseñas de ejemplo están en el README; aquí solo quedan sus huellas.
// L18: en producción cada usuario tendría una sal real randomBytes(16), como la
// que genera scripts/crear-hospitalero.mjs.
const HOSPITALEROS: HospitaleroGuardado[] = [
  {
    id: 'h-marta',
    usuario: 'marta',
    nombre: 'Marta Díez',
    sal: 'cea-marta-2026-sal',
    hash: 'ce3b70dbc6d9503663c8094bd16350e5b40d53961273f9ad095710d1dc2ca4ca',
  },
  {
    id: 'h-ignacio',
    usuario: 'ignacio',
    nombre: 'Ignacio Prieto',
    sal: 'cea-ignacio-2026-sal',
    hash: '104584f9a727ebe5d4f222e6142841f2d6e88929d86cc433b1f45b93dcf99c0a',
  },
]

function publico({ sal: _sal, hash: _hash, ...hospitalero }: HospitaleroGuardado): Hospitalero {
  return hospitalero
}

export function buscarHospitalero(id: unknown): Hospitalero | null {
  const hospitalero = HOSPITALEROS.find((candidato) => candidato.id === id)
  return hospitalero ? publico(hospitalero) : null
}

const SAL_DE_RELLENO = 'cea-relleno-2026-sal'

export async function comprobarCredenciales(usuario: string, clave: string): Promise<Hospitalero | null> {
  const hospitalero = HOSPITALEROS.find((candidato) => candidato.usuario === usuario.trim().toLowerCase())
  // L18: scrypt deriva una huella costosa con sal; la sal de relleno hace un
  // trabajo equivalente si no existe el usuario y reduce la enumeración por tiempo.
  const calculada = await derivar(clave, hospitalero?.sal ?? SAL_DE_RELLENO, 32)
  if (!hospitalero) return null
  // timingSafeEqual evita que el primer byte distinto se pueda inferir por duración.
  return timingSafeEqual(calculada, Buffer.from(hospitalero.hash, 'hex')) ? publico(hospitalero) : null
}
