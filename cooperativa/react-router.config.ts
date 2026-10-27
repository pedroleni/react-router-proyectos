import type { Config } from '@react-router/dev/config'

export default {
  // Renderizado en el servidor: cada página se genera al pedirla.
  ssr: true,

  // Salvo estas dos, que no cambian de una semana a otra ni dependen de quién
  // las pide: se generan una vez, al construir, y se sirven como archivos.
  prerender: ['/', '/como-funciona'],

  // React Router rechaza los envíos a sus action que llegan desde otro origen.
  // En producción, la cooperativa va detrás de un proxy con HTTPS y
  // react-router-serve ve llegar http://: sin esta línea, el navegador dice
  // https://pedidos.huertadelebro.es, el servidor cree que es otro origen y
  // rechaza todos los formularios con un 400.
  allowedActionOrigins: ['pedidos.huertadelebro.es'],
} satisfies Config
