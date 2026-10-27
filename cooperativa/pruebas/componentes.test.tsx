import { describe, it } from 'vitest'

// TODO (paso 9): escribe aquí tus pruebas de componentes con createRoutesStub.
// createRoutesStub monta los componentes dentro de un router de verdad, con
// rutas, loader y action de mentira. Sirve para los componentes que usan hooks
// del router (useFetcher, useNavigation, useActionData...), no para los módulos
// de ruta enteros: sus tipos Route.* salen de la app real y no cuadran con un stub.
//
// Lo que vas a necesitar:
// - render y screen de @testing-library/react, y userEvent de
//   @testing-library/user-event;
// - createRoutesStub, data, useLoaderData y useActionData de react-router;
// - ListaCesta, ResumenCesta y FormularioPedido de ~/componentes, y
//   productosDeLaSemana() y cestaDelFormulario() para una action de mentira
//   que se comporte como la de verdad.
//
// Pistas:
// - La cantidad de cada producto es un <output> con aria-label «Cantidad de
//   <producto>»: screen.getByRole('status', { name: 'Cantidad de Borraja' }).
// - Para que el servidor «tarde», haz que la action espere a una promesa que
//   resuelves tú cuando quieras.

describe('Paso 9: probar los componentes con createRoutesStub', () => {
  it.todo('la cesta cambia en cuanto pulsas, antes de que responda el servidor, y el resumen también')
  it.todo('si el servidor rechaza el cambio, la cesta vuelve a como estaba y sale el error')
  it.todo('el formulario del pedido enseña los errores de la action junto a cada campo y lleva el foco al primero')
})
