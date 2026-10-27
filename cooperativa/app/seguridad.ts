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
  // TODO (paso 7): esto no basta. //otra-web.example y /\otra-web.example
  // empiezan por una barra, pero el navegador las lee como otro dominio.
  // Interpreta volver como lo haría el navegador, new URL(volver, origen), con
  // el origen de la petición (new URL(request.url).origin), y acéptalo solo si
  // se queda en ese origen y su ruta, ya normalizada, no empieza por //:
  // /.//otra-web.example es de tu origen, pero new URL lo deja en
  // //otra-web.example. Devuelve pathname + search + hash. Si no, o si
  // new URL lanza un error, href('/socio').
  void request
  if (typeof volver === 'string' && volver.startsWith('/')) return volver
  return href('/socio')
}
