import { z } from 'zod'

// Las reglas del formulario del pedido, como un esquema de Zod (lección 61 de
// React). Los mensajes van escritos en cada regla: los de Zod por defecto
// están en inglés y no le dicen nada a quien rellena el pedido.

export const PedidoFormulario = z.object({
  punto: z.enum(['casco', 'actur', 'torrero'], 'Elige dónde recogerás la cesta.'),
  dia: z.enum(['jueves', 'viernes'], 'Elige qué día la recogerás.'),
  telefono: z
    .string('Escribe un teléfono para avisarte.')
    .trim()
    .regex(/^[6789]\d{8}$/, 'Escribe un teléfono de nueve cifras, sin espacios: 612345678.'),
  comentario: z
    .string()
    .trim()
    .max(200, 'El comentario puede tener como mucho 200 caracteres.')
    .default(''),
})

export type DatosPedido = z.infer<typeof PedidoFormulario>
export type CampoPedido = keyof DatosPedido

/** El pedido mínimo, en céntimos: la furgoneta reparte por barrios. */
export const PEDIDO_MINIMO = 1000
