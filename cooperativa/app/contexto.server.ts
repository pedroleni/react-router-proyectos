import { createContext } from 'react-router'
import type { Sesion } from './sesiones.server'
import type { Socio } from './tipos'

// Las claves con tipo del context de cada petición. Sin valor por defecto:
// si un loader lee una que nadie ha puesto, React Router lanza un error en vez
// de devolver undefined. En la zona de socios, las pone el middleware.

/** El socio que ha iniciado sesión. */
export const socioContext = createContext<Socio>()

/** Su sesión, para leer y cambiar la cesta o dejar un aviso. */
export const sesionContext = createContext<Sesion>()
