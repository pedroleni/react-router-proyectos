import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  // La parte pública: igual para todo el mundo.
  index('routes/inicio.tsx'),
  route('como-funciona', 'routes/como-funciona.tsx'),
  route('catalogo', 'routes/catalogo.tsx'),
  route('entrar', 'routes/entrar.tsx'),
  route('salir', 'routes/salir.tsx'),

  // La zona de socios: zona.tsx tiene el middleware que la protege entera.
  route('socio', 'routes/zona.tsx', [
    index('routes/cesta.tsx'),
    route('pedido', 'routes/pedido.tsx'),
    route('pedidos', 'routes/pedidos.tsx'),
    route('pedidos/:id', 'routes/pedido-detalle.tsx'),
    // Una ruta de recursos: responde un CSV, no una página.
    route('reparto.csv', 'routes/reparto-csv.ts'),
  ]),

  // Cualquier otra dirección: la página «no encontrada», con su 404.
  route('*', 'routes/no-encontrada.tsx'),
] satisfies RouteConfig
