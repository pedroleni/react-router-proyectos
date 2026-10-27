import type { Config } from '@react-router/dev/config'

export default {
  // Renderizado en el servidor: cada página se genera al pedirla.
  ssr: true,

  // TODO (paso 6): prerenderiza la portada (/) y «Cómo funciona»
  // (/como-funciona), las dos páginas que no cambian de una semana a otra ni
  // dependen de quién las pide.

  // TODO (paso 7): en producción, la cooperativa va detrás de un proxy con
  // HTTPS en pedidos.huertadelebro.es. Añade ese host a allowedActionOrigins.
} satisfies Config
