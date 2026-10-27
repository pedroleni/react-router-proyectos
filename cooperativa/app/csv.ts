// Un CSV que Excel y LibreOffice abren bien en español:
// - punto y coma entre columnas, porque la coma es el separador decimal;
// - una marca BOM al principio, para que lean las tildes como UTF-8;
// - saltos de línea \r\n, como pide el RFC 4180.

const SEPARADOR = ';'

/** Una celda, lista para ir entre punto y coma. */
export function celdaCsv(valor: string | number): string {
  // TODO (paso 5):
  // - Inyección de fórmulas: si empieza por = + - @, un tabulador o \r, ponle
  //   un apóstrofo delante. Así la hoja de cálculo lo trata como texto.
  // - Si lleva el separador, comillas o un salto de línea, enciérrala entre
  //   comillas y escribe dos veces las comillas de dentro.
  return String(valor)
}

/** Un CSV entero: la primera fila es la de los títulos. */
export function aCsv(filas: (string | number)[][]): string {
  // TODO (paso 5): empieza con la marca BOM ('\uFEFF'), pasa cada valor por
  // celdaCsv y termina cada fila (también la última) con \r\n.
  return filas.map((fila) => fila.join(SEPARADOR)).join('\n')
}
