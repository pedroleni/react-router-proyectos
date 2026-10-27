import { useFetcher } from 'react-router'
import type { action } from './routes/cesta'
import type { Cesta, LineaPedido, Producto } from './tipos'

// La cesta, en funciones puras que usan los dos lados: la action del servidor
// para guardarla y el navegador para pintarla antes de que llegue la respuesta.

/** El fetcher de la cesta. Con la misma key, la lista y el resumen comparten envío. */
export const FETCHER_CESTA = 'cesta'

export type Cambio = { tipo: 'sumar' | 'restar'; productoId: string } | { tipo: 'vaciar' }

/** «sumar:borraja», «restar:borraja» o «vaciar», el valor del botón pulsado. */
export function leerCambio(valor: FormDataEntryValue | null): Cambio | null {
  if (valor === 'vaciar') return { tipo: 'vaciar' }
  const partes = typeof valor === 'string' ? /^(sumar|restar):([a-z]+)$/.exec(valor) : null
  return partes ? { tipo: partes[1] as 'sumar' | 'restar', productoId: partes[2] } : null
}

/** La cesta después de un cambio, sin bajar de 0 ni pasar del máximo de cada producto. */
export function aplicarCambio(cesta: Cesta, cambio: Cambio, productos: Producto[]): Cesta {
  // TODO (paso 3): devuelve una cesta nueva (sin tocar la que recibes):
  // - «vaciar» la deja vacía;
  // - «sumar» y «restar» cambian en uno el producto, sin bajar de 0 ni pasar de
  //   su maximo; un producto que no está en la lista deja la cesta igual;
  // - un producto que se queda a 0 desaparece de la cesta.
  void cambio
  void productos
  return cesta
}

/**
 * La cesta que pide un envío del formulario: las cantidades que llevaba (un
 * campo oculto por producto) más el cambio del botón pulsado. null si algo no
 * cuadra: más unidades que el máximo, un producto que no existe, un cambio raro...
 */
export function cestaDelFormulario(formulario: FormData, productos: Producto[]): Cesta | null {
  // TODO (paso 3): para cada producto, lee el campo cantidad-<id>. Si no está,
  // sáltalo; si no es un entero entre 0 y su maximo, devuelve null; si es más
  // de 0, va a la cesta. Después lee el campo «cambio» con leerCambio: si es
  // null, o si suma o resta un producto que no existe, devuelve null. Si no,
  // devuelve la cesta con el cambio aplicado (aplicarCambio).
  void formulario
  void productos
  return null
}

/** Las líneas de la cesta, con el nombre y el precio de cada producto. */
export function lineasDeCesta(cesta: Cesta, productos: Producto[]): LineaPedido[] {
  return productos
    .filter((p) => (cesta[p.id] ?? 0) > 0)
    .map((p) => ({ productoId: p.id, nombre: p.nombre, formato: p.formato, precio: p.precio, cantidad: cesta[p.id] }))
}

export function totalDeCesta(cesta: Cesta, productos: Producto[]): number {
  return lineasDeCesta(cesta, productos).reduce((suma, l) => suma + l.precio * l.cantidad, 0)
}

export function unidadesDeCesta(cesta: Cesta): number {
  return Object.values(cesta).reduce((suma, n) => suma + n, 0)
}

/**
 * La cesta que hay que pintar: la del servidor o, mientras se envía un cambio,
 * la que ese envío pide. Si el servidor lo rechaza, el fetcher vuelve a estar
 * libre, formData desaparece y se vuelve a pintar la del servidor, sola.
 */
export function useCestaOptimista(cesta: Cesta, productos: Producto[]) {
  const fetcher = useFetcher<typeof action>({ key: FETCHER_CESTA })
  // TODO (paso 3): la respuesta optimista. Mientras haya fetcher.formData, la
  // cesta que se pinta es la que pide ese envío: cestaDelFormulario(formData,
  // productos). Si eso da null, o no hay envío, la que llega del servidor.
  void productos
  return { fetcher, cesta }
}
