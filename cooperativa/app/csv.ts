// Un CSV que Excel y LibreOffice abren bien en español:
// - punto y coma entre columnas, porque la coma es el separador decimal;
// - una marca BOM al principio, para que lean las tildes como UTF-8;
// - saltos de línea \r\n, como pide el RFC 4180.

const SEPARADOR = ';'

/** Una celda, lista para ir entre punto y coma. */
export function celdaCsv(valor: string | number): string {
  let texto = String(valor)
  // Inyección de fórmulas: una hoja de cálculo ejecuta como fórmula cualquier
  // celda que empiece por = + - o @. Con un apóstrofo delante, es texto.
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`
  // Si lleva el separador, comillas o un salto de línea, va entre comillas, y
  // las comillas de dentro se escriben dos veces.
  if (/[;"\r\n]/.test(texto)) texto = `"${texto.replaceAll('"', '""')}"`
  return texto
}

/** Un CSV entero: la primera fila es la de los títulos. */
export function aCsv(filas: (string | number)[][]): string {
  return '\uFEFF' + filas.map((fila) => fila.map(celdaCsv).join(SEPARADOR)).join('\r\n') + '\r\n'
}
