/** L20: solo acepta destinos internos, sin ambigüedades para el navegador. */
export function destinoSeguro(volver: FormDataEntryValue | null, porDefecto: string): string {
  // `//` cambia de origen, `/\` se interpreta distinto entre navegadores y los
  // controles permiten inyectar cabeceras; por eso se rechazan antes de parsear.
  if (typeof volver !== 'string' || volver === '' || /[\u0000-\u001f\u007f\\]/.test(volver)) return porDefecto
  // Solo una barra inicial representa una ruta interna inequívoca.
  if (!/^\/(?!\/)/.test(volver)) return porDefecto
  let destino: URL
  try {
    destino = new URL(volver, 'http://interno.invalid')
    // Comprobar el origen no basta: URL normaliza los segmentos `.` y `..`, y algunas entradas
    // internas acaban convertidas en una ruta que empieza por `//`.
    if (destino.origin !== 'http://interno.invalid') return porDefecto
    if (/[\u0000-\u001f\u007f\\]/.test(decodeURIComponent(destino.pathname))) return porDefecto
  } catch {
    return porDefecto
  }
  const normalizado = destino.pathname + destino.search + destino.hash
  if (!/^\/(?!\/)/.test(normalizado)) return porDefecto
  // Evita bucles al volver desde las pantallas que crean o destruyen la sesión.
  if (destino.pathname === '/entrar' || destino.pathname === '/salir') return porDefecto
  return normalizado
}
