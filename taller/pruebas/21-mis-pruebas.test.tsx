import { RouterContextProvider, createRoutesStub, data } from 'react-router'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { hospitaleroContext, sesionContext } from '~/contexto.server'
import { guardarReserva } from '~/datos/reservas.server'
import { loader as cargarHoy } from '~/routes/hospitaleros/hoy'
import { exigirHospitalero } from '~/middleware/hospitalero.server'
import { action as reservar, ReservaFormulario } from '~/routes/reservar'
import { crearAlmacenDeSesiones } from '~/sesiones.server'
import { argumentos, envio } from './peticion'

function estado(valor: unknown): number | undefined {
  return (valor as { init?: ResponseInit }).init?.status
}

describe('lección 21: probar rutas', () => {
  it('muestra con createRoutesStub el error devuelto por una action falsa', async () => {
    // Se extrajo ReservaFormulario para probarlo con createRoutesStub sin chocar
    // con los tipos Route.*; para un componente de ruta, la documentación usa
    // `// @ts-expect-error` porque el stub no pertenece al manifiesto real.
    const Stub = createRoutesStub([
      {
        path: '/reservar',
        Component: ReservaFormulario,
        action: () => data({ errores: { noche: ['No quedan camas para esa noche.'] } }, { status: 409 }),
      },
    ])
    render(<Stub initialEntries={['/reservar']} />)
    const usuario = userEvent.setup()
    await usuario.type(screen.getByLabelText('Nombre'), 'Rita Nunes')
    await usuario.type(screen.getByLabelText(/Tres últimas/), '123')
    await usuario.type(screen.getByLabelText('Noche'), '2030-05-05')
    await usuario.click(screen.getByRole('button', { name: 'Reservar' }))
    expect(await screen.findByText('No quedan camas para esa noche.')).toBeInTheDocument()
  })

  it('llama al loader de hoy con un contexto tipado', async () => {
    const context = new RouterContextProvider()
    const almacen = crearAlmacenDeSesiones(['prueba'])
    context.set(hospitaleroContext, { id: 'h-prueba', usuario: 'turno', nombre: 'Turno de prueba' })
    context.set(sesionContext, await almacen.getSession())
    const resultado = await cargarHoy(
      argumentos<Parameters<typeof cargarHoy>[0]>('/hospitaleros', { context }),
    )
    expect(resultado.hospitalero.nombre).toBe('Turno de prueba')
    expect(resultado.reservas.length).toBeGreaterThan(0)
    expect(resultado.reservas.every((reserva) => reserva.noche === resultado.noche)).toBe(true)
  })

  it('la action de reservar da 400 por campos y 409 si la noche está llena', async () => {
    const invalida = await reservar(
      argumentos<Parameters<typeof reservar>[0]>('/reservar', {
        init: envio({ nombre: '', documento: '', noche: 'mal', personas: '0' }),
      }),
    )
    expect(estado(invalida)).toBe(400)
    await guardarReserva({
      id: 'llena',
      noche: '2031-06-08',
      nombre: 'Grupo de prueba',
      documento: '***999',
      personas: 24,
      estado: 'reservada',
      credencial: null,
    })
    const llena = await reservar(
      argumentos<Parameters<typeof reservar>[0]>('/reservar', {
        init: envio({ nombre: 'Rita Nunes', documento: '123', noche: '2031-06-08', personas: '1' }),
      }),
    )
    expect(estado(llena)).toBe(409)
  })

  it('el middleware no llama a next cuando falta la sesión', async () => {
    const next = vi.fn()
    let lanzado: Response | undefined
    try {
      await exigirHospitalero(argumentos<Parameters<typeof exigirHospitalero>[0]>('/hospitaleros'), next)
    } catch (error) {
      if (error instanceof Response) lanzado = error
    }
    expect(next).not.toHaveBeenCalled()
    expect(lanzado).toBeInstanceOf(Response)
    if (!lanzado) throw new Error('Se esperaba la redirección del middleware.')
    expect(lanzado.status).toBe(302)
    expect(lanzado.headers.get('Location')).toBe('/entrar?volver=%2Fhospitaleros')
  })
})
