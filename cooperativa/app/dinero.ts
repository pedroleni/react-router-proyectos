const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })

/** 240 → «2,40 €». Los precios se guardan en céntimos para no sumar decimales. */
export function formatearEuros(centimos: number): string {
  return euros.format(centimos / 100)
}
