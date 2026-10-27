import type { Config } from '@react-router/dev/config'
import { ETAPAS } from './app/datos/etapas'

export default {
  // La app usa renderizado de servidor para las páginas que cambian.
  ssr: true,
  // app/ es el valor por defecto; se deja escrito para enseñarlo en la lección 14.
  appDirectory: 'app',
  // Lección 17. Se generan al construir solo las páginas que son iguales para
  // todo el mundo y no cambian hasta el próximo despliegue: «El albergue» y una
  // por etapa. La portada no: enseña el aviso del Ayuntamiento, que llega por el
  // webhook en cualquier momento (lección 19), y una página generada al
  // construir no se enteraría. Un array basta cuando la lista ya está en memoria;
  // la función sirve si hay que pedirla, por ejemplo de forma asíncrona.
  prerender: ['/albergue', ...ETAPAS.map((etapa) => `/etapas/${etapa.slug}`)],
  // Detrás del proxy HTTPS el servidor puede ver HTTP; se autoriza el host
  // público para que esa diferencia no bloquee los formularios legítimos.
  allowedActionOrigins: ['albergue-el-cea.es'],
} satisfies Config
