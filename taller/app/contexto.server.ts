import { createContext } from 'react-router'
import type { Hospitalero } from '~/tipos'
import type { Sesion } from '~/sesiones.server'

// TODO (lección 15): crea el contexto tipado sin valor por defecto para que
// olvidar el middleware sea un error. Busca createContext.
export const hospitaleroContext = createContext<Hospitalero>({
  id: 'TODO',
  usuario: 'TODO',
  nombre: 'TODO (lección 15)',
})
export const sesionContext = createContext<Sesion>({} as Sesion)
