import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

export default [
  // L14: layout() comparte interfaz sin añadir un segmento a la URL.
  layout('routes/publico.tsx', [
    index('routes/portada.tsx'),
    route('albergue', 'routes/albergue.tsx'),
    route('etapas', 'routes/etapas.tsx'),
    route('etapas/:etapa', 'routes/etapa.tsx'),
    route('camas', 'routes/camas.tsx'),
    route('reservar', 'routes/reservar.tsx'),
    route('mi-camino', 'routes/mi-camino.tsx'),
  ]),
  route('entrar', 'routes/entrar.tsx'),
  route('salir', 'routes/salir.tsx'),
  // L14: route() crea /hospitaleros y su layout; prefix() solo agruparía el
  // prefijo y no aportaría un módulo de ruta propio.
  route('hospitaleros', 'routes/hospitaleros/zona.tsx', [
    index('routes/hospitaleros/hoy.tsx'),
    route('reservas/:id', 'routes/hospitaleros/reserva.tsx'),
    route('pernoctas.csv', 'routes/hospitaleros/pernoctas-csv.ts'),
  ]),
  route('etapas.json', 'routes/recursos/etapas-json.ts'),
  route('sitemap.xml', 'routes/recursos/sitemap.ts'),
  route('api/avisos', 'routes/recursos/avisos.ts'),
  // L14: el comodín queda al final por claridad; React Router ordena las rutas por especificidad.
  route('*', 'routes/no-encontrada.tsx'),
] satisfies RouteConfig
