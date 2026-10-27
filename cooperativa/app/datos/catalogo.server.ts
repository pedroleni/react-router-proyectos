import type { Producto } from '~/tipos'

// El catálogo de la semana. En una cooperativa de verdad saldría de una base
// de datos que la comisión de compras actualiza cada lunes; aquí, de esta lista.

export const SEMANA = {
  numero: 44,
  /** Hasta cuándo se puede pedir. */
  cierre: 'miércoles 28 de octubre a las 20:00',
  recogida: 'jueves 29 y viernes 30 de octubre',
}

const PRODUCTOS: Producto[] = [
  { id: 'borraja', nombre: 'Borraja', formato: 'manojo de 1 kg', origen: 'Movera', precio: 240, maximo: 4 },
  { id: 'acelga', nombre: 'Acelga', formato: 'manojo', origen: 'Juslibol', precio: 160, maximo: 4 },
  { id: 'cebolla', nombre: 'Cebolla de Fuentes', formato: 'malla de 2 kg', origen: 'Fuentes de Ebro', precio: 320, maximo: 3 },
  { id: 'tomate', nombre: 'Tomate rosa', formato: 'kilo', origen: 'Montañana', precio: 390, maximo: 4 },
  { id: 'calabaza', nombre: 'Calabaza', formato: 'pieza de unos 2 kg', origen: 'Garrapinillos', precio: 300, maximo: 2 },
  { id: 'melocoton', nombre: 'Melocotón de Calanda', formato: 'kilo', origen: 'Calanda', precio: 450, maximo: 4 },
  { id: 'manzana', nombre: 'Manzana reineta', formato: 'kilo', origen: 'Monzalbarba', precio: 220, maximo: 4 },
  { id: 'huevos', nombre: 'Huevos camperos', formato: 'docena', origen: 'Peñaflor', precio: 360, maximo: 3 },
  { id: 'pan', nombre: 'Pan de cinta', formato: 'pieza de 500 g', origen: 'Alfajarín', precio: 210, maximo: 3 },
  { id: 'aceite', nombre: 'Aceite de oliva virgen extra', formato: 'botella de 1 l', origen: 'Alcañiz', precio: 950, maximo: 2 },
]

/** Los productos que se pueden pedir esta semana, en el orden del catálogo. */
export function productosDeLaSemana(): Producto[] {
  return PRODUCTOS
}
