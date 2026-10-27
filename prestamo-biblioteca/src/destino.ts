// Adónde volver después de entrar. «volver» llega en la URL y cualquiera puede
// escribirla: solo se acepta una dirección de esta misma web. Se interpreta
// como lo haría el navegador, y se acepta si se queda en nuestro origen y su
// ruta, ya normalizada, no empieza por //.
export function destinoSeguro(volver: string | null, origen: string, porDefecto = '/prestamos') {
  if (!volver) return porDefecto
  let url: URL
  try {
    url = new URL(volver, origen)
  } catch {
    // Una dirección mal formada («http://[») no es de esta web.
    return porDefecto
  }
  // //otra-web.example y /\otra-web.example empiezan por una barra, pero el
  // navegador las lee como otro dominio: por eso no basta con startsWith('/').
  if (url.origin !== origen) return porDefecto
  // Y el origen tampoco basta: new URL normaliza la ruta, y /.//otra-web.example,
  // que es de nuestro origen, queda en //otra-web.example. Pasada a navigate(),
  // el navegador también la lee como otro dominio.
  const ruta = url.pathname + url.search + url.hash
  return ruta.startsWith('//') ? porDefecto : ruta
}
