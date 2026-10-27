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
  if (cambio.tipo === 'vaciar') return {}
  const producto = productos.find((p) => p.id === cambio.productoId)
  if (!producto) return cesta
  const actual = cesta[producto.id] ?? 0
  const nueva = Math.min(producto.maximo, Math.max(0, actual + (cambio.tipo === 'sumar' ? 1 : -1)))
  const { [producto.id]: _quitada, ...resto } = cesta
  return nueva > 0 ? { ...resto, [producto.id]: nueva } : resto
}

/**
 * La cesta que pide un envío del formulario: las cantidades que llevaba (un
 * campo oculto por producto) más el cambio del botón pulsado. null si algo no
 * cuadra: más unidades que el máximo, un producto que no existe, un cambio raro...
 */
export function cestaDelFormulario(formulario: FormData, productos: Producto[]): Cesta | null {
  const cesta: Cesta = {}
  for (const producto of productos) {
    const valor = formulario.get(`cantidad-${producto.id}`)
    if (valor === null) continue
    const cantidad = Number(valor)
    if (!Number.isInteger(cantidad) || cantidad < 0 || cantidad > producto.maximo) return null
    if (cantidad > 0) cesta[producto.id] = cantidad
  }
  const cambio = leerCambio(formulario.get('cambio'))
  if (!cambio) return null
  if (cambio.tipo !== 'vaciar' && !productos.some((p) => p.id === cambio.productoId)) return null
  return aplicarCambio(cesta, cambio, productos)
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
  const enviada = fetcher.formData ? cestaDelFormulario(fetcher.formData, productos) : null
  return { fetcher, cesta: enviada ?? cesta }
}
