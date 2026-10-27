import { createContext } from 'react-router'
import type { Hospitalero } from '~/tipos'
import type { Sesion } from '~/sesiones.server'

// L15: sin valor por defecto, olvidar el middleware falla pronto en vez de
// inventar un hospitalero; sesionContext permite consumir y persistir el flash.
export const hospitaleroContext = createContext<Hospitalero>()
export const sesionContext = createContext<Sesion>()
