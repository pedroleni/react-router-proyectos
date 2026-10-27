const SEPARADOR = ';'

export function celdaCsv(valor: string | number): string {
  let texto = String(valor)
  // L19: Excel interpreta estos prefijos como fórmulas; la comilla los fuerza a texto.
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`
  if (/[;"\r\n]/.test(texto)) texto = `"${texto.replaceAll('"', '""')}"`
  return texto
}

export function aCsv(filas: (string | number)[][]): string {
  // L19: el BOM ayuda a Excel con UTF-8 y `;` es el separador habitual en España.
  return '\uFEFF' + filas.map((fila) => fila.map(celdaCsv).join(SEPARADOR)).join('\r\n') + '\r\n'
}
