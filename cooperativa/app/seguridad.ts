import { href } from 'react-router'

/**
 * Adónde llevar a alguien después de entrar. ?volver= llega en la URL, así
 * que cualquiera puede fabricar un enlace a /entrar?volver=https://otra-web:
 * sin comprobarlo, la cooperativa mandaría a sus socios, recién identificados,
 * a una web ajena (una redirección abierta). Se interpreta la dirección como
 * lo haría el navegador y solo se acepta si se queda en nuestro origen y su
 * ruta, ya normalizada, no empieza por //.
 */
export function destinoSeguro(volver: FormDataEntryValue | null, request: Request): string {
  const porDefecto = href('/socio')
  if (typeof volver !== 'string' || volver === '') return porDefecto

  const origen = new URL(request.url).origin
  let destino: URL
  try {
    destino = new URL(volver, origen)
  } catch {
    return porDefecto
  }
  // //otra-web.example y /\otra-web.example empiezan por una barra, pero el
  // navegador las lee como otro dominio: por eso no basta con startsWith('/').
  if (destino.origin !== origen) return porDefecto
  // Y el origen tampoco basta: new URL normaliza la ruta, y /.//otra-web.example,
  // que es de nuestro origen, queda en //otra-web.example. En Location, el
  // navegador también la lee como otro dominio.
  const ruta = destino.pathname + destino.search + destino.hash
  return ruta.startsWith('//') ? porDefecto : ruta
}
