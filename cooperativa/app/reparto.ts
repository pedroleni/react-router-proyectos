import type { Dia, Punto } from './tipos'

// Dónde y cuándo se recogen las cestas de la semana 44. Lo usan el formulario
// del pedido, el aviso de confirmación y la hoja de reparto.

export const PUNTOS: Record<Punto, string> = {
  casco: 'Casco Histórico, en el local de la cooperativa',
  actur: 'Actur, en el centro cívico',
  torrero: 'Torrero, en la asociación vecinal',
}

export const DIAS: Record<Dia, string> = {
  jueves: 'jueves 29, de 18:00 a 20:30',
  viernes: 'viernes 30, de 10:00 a 13:00',
}

/** En la hoja de reparto, los puntos van en el orden en que pasa la furgoneta. */
export const ORDEN_DE_REPARTO: Punto[] = ['casco', 'actur', 'torrero']
