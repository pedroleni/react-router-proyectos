import { describe, expect, it } from 'vitest'

describe('lección 21: probar rutas', () => {
  it('muestra con createRoutesStub el error devuelto por una action falsa', () => {
    // Prueba ReservaFormulario con una action falsa que devuelva un error de noche sin camas.
    // La documentación avisa de la fricción entre createRoutesStub y los tipos Route.*.
    expect.fail('TODO (lección 21): prueba el formulario con createRoutesStub.')
  })

  it('llama al loader de hoy con un contexto tipado', () => {
    // Construye RouterContextProvider, rellena hospitaleroContext y sesionContext,
    // llama al loader como función y comprueba las reservas de su noche.
    expect.fail('TODO (lección 21): prueba el loader con contexto tipado.')
  })

  it('la action de reservar da 400 por campos y 409 si la noche está llena', () => {
    // Crea Request/FormData reales: uno inválido por campos y otro que exceda
    // la capacidad después de guardar una reserva de 24 plazas.
    expect.fail('TODO (lección 21): prueba los estados 400 y 409 de la action.')
  })

  it('el middleware no llama a next cuando falta la sesión', () => {
    // Invoca exigirHospitalero directamente con un next falso y comprueba la
    // redirección y que la función siguiente no se ejecuta.
    expect.fail('TODO (lección 21): prueba el middleware sin sesión.')
  })
})
