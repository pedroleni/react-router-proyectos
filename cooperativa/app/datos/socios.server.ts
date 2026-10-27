import { scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import type { Socio } from '~/tipos'

const derivar = promisify(scrypt) as (clave: string, sal: string, longitud: number) => Promise<Buffer>

type SocioGuardado = Socio & { sal: string; hash: string }

// Los socios, con la contraseña cifrada con scrypt y una sal distinta para
// cada uno. Ninguna contraseña está escrita en el código: solo su huella.
// Para probar: pilar@huertadelebro.example con «borraja2026» (socia) y
// javier@huertadelebro.example con «cebolla2026» (coordina el reparto).
const SOCIOS: SocioGuardado[] = [
  {
    id: 'S-0142',
    numero: 142,
    nombre: 'Pilar Lasierra',
    correo: 'pilar@huertadelebro.example',
    rol: 'socio',
    sal: '54b8aa3f9a58b33c990c4b2b99a5df33',
    hash: '762fe7d231147beed693e2eb902e95e22eb62254a9f828bcde13d94b44c22b11',
  },
  {
    id: 'S-0007',
    numero: 7,
    nombre: 'Javier Gimeno',
    correo: 'javier@huertadelebro.example',
    rol: 'reparto',
    sal: '3e3a1270ac0ef148420e4cd25b555f9a',
    hash: 'a6eb4f6428fc2f8205160397692cfa8c84ad84f21191ef346c9f4f0eeb8a080c',
  },
  {
    id: 'S-0088',
    numero: 88,
    nombre: 'Lucía Abadía',
    correo: 'lucia@huertadelebro.example',
    rol: 'socio',
    sal: '23364ce74e5175f969f0c543be2599aa',
    hash: 'ea85666aee64990d7b5267bd6c9e70c44223ae4a2113336bb227826e918e5199',
  },
  {
    id: 'S-0115',
    numero: 115,
    nombre: 'Miguel Royo',
    correo: 'miguel@huertadelebro.example',
    rol: 'socio',
    sal: 'dd78594b2f188eb0d1a4374fcde4c589',
    hash: 'af494f12a5706304613c30251216dbe3fed15cb36ef345ebccc3357715661fc1',
  },
  {
    id: 'S-0131',
    numero: 131,
    nombre: 'Carmen Aznar',
    correo: 'carmen@huertadelebro.example',
    rol: 'socio',
    sal: '1e055228f9315d40cf50aaa88e8ad578',
    hash: '6d8f0a53ff9c24c8285e55051cbd5f6455cc7931346e54959c404c9e91950bd4',
  },
]

/** Quita la sal y la huella: lo que queda puede viajar al navegador. */
function publico({ sal: _sal, hash: _hash, ...socio }: SocioGuardado): Socio {
  return socio
}

/** El socio con ese id, o null. Acepta cualquier cosa: el id llega de una cookie. */
export function buscarSocio(id: unknown): Socio | null {
  const socio = SOCIOS.find((s) => s.id === id)
  return socio ? publico(socio) : null
}

// Para un correo que no existe también se calcula una huella: así la
// respuesta tarda lo mismo y no delata qué correos son de socios.
const SAL_DE_RELLENO = '00000000000000000000000000000000'

/** El socio si el correo y la contraseña son correctos; si no, null. */
export async function comprobarCredenciales(correo: string, clave: string): Promise<Socio | null> {
  const socio = SOCIOS.find((s) => s.correo === correo.trim().toLowerCase())
  const calculada = await derivar(clave, socio?.sal ?? SAL_DE_RELLENO, 32)
  if (!socio) return null
  return timingSafeEqual(calculada, Buffer.from(socio.hash, 'hex')) ? publico(socio) : null
}
