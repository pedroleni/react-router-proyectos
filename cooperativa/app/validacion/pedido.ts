import { z } from 'zod'

// Las reglas del formulario del pedido, como un esquema de Zod (lección 61 de
// React). Los mensajes van escritos en cada regla: los de Zod por defecto
// están en inglés y no le dicen nada a quien rellena el pedido.

// TODO (paso 4): el esquema ya tiene sus cuatro campos, pero ninguna regla
// ni ningún mensaje. Escríbelos, con estos textos exactos (los tests los comprueban):
// - punto: 'Elige dónde recogerás la cesta.'
// - dia: 'Elige qué día la recogerás.'
// - telefono: sin espacios a los lados (trim) y con nueve cifras que empiezan
//   por 6, 7, 8 o 9 (regex). Si falta: 'Escribe un teléfono para avisarte.';
//   si no cuadra: 'Escribe un teléfono de nueve cifras, sin espacios: 612345678.'
// - comentario: trim, como mucho 200 caracteres ('El comentario puede tener
//   como mucho 200 caracteres.') y, si no llega, '' (default).
export const PedidoFormulario = z.object({
  punto: z.enum(['casco', 'actur', 'torrero']),
  dia: z.enum(['jueves', 'viernes']),
  telefono: z.string(),
  comentario: z.string(),
})

export type DatosPedido = z.infer<typeof PedidoFormulario>
export type CampoPedido = keyof DatosPedido

/** El pedido mínimo, en céntimos: la furgoneta reparte por barrios. */
export const PEDIDO_MINIMO = 1000
