import { redirect, type RouteObject } from 'react-router'
import * as catalogo from './rutas/catalogo'
import * as entrar from './rutas/entrar'
import * as ficha from './rutas/ficha'
import * as noEncontrada from './rutas/no-encontrada'
import * as nuevoPrestamo from './rutas/nuevo-prestamo'
import * as prestamos from './rutas/prestamos'
import * as raiz from './rutas/raiz'
import * as salir from './rutas/salir'
import { exigirSesion } from './sesion'

// Cada módulo de src/rutas/ exporta las piezas de un objeto de ruta (loader,
// action, Component, ErrorBoundary…), así que basta con esparcirlo.
export const rutas: RouteObject[] = [
  {
    id: 'raiz',
    path: '/',
    ...raiz,
    children: [
      // La dirección raíz, al catálogo: lo que hacía <Navigate replace>. El
      // componente vacío no llega a pintarse (el loader redirige antes), pero
      // sin él el router avisa en la consola: «Matched leaf route at location
      // "/" does not have an element or Component».
      { index: true, loader: () => redirect('/catalogo'), Component: () => null },
      { path: 'catalogo', ...catalogo },
      { path: 'catalogo/:id', ...ficha },
      { path: 'entrar', ...entrar },
      { path: 'salir', ...salir },
      // Una ruta sin path que solo pone el middleware: lo heredan sus hijas.
      {
        middleware: [exigirSesion],
        children: [
          { path: 'prestamos', ...prestamos },
          { path: 'prestamos/nuevo', ...nuevoPrestamo },
        ],
      },
      { path: '*', ...noEncontrada },
    ],
  },
]
