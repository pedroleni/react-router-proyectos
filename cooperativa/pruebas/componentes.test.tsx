import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRoutesStub, data, useActionData, useLoaderData } from 'react-router'
import { describe, expect, it } from 'vitest'
import { cestaDelFormulario } from '~/cesta'
import FormularioPedido, { type ResultadoPedido } from '~/componentes/FormularioPedido'
import ListaCesta from '~/componentes/ListaCesta'
import ResumenCesta from '~/componentes/ResumenCesta'
import { productosDeLaSemana } from '~/datos/catalogo.server'
import type { Cesta } from '~/tipos'

// createRoutesStub monta los componentes dentro de un router de verdad, con
// rutas, loader y action de mentira. Sirve para los componentes que usan
// hooks del router (useFetcher, useNavigation...), no para los módulos de ruta
// enteros: sus tipos Route.* salen de la app real y no cuadran con un stub.

const productos = productosDeLaSemana()

/** Una promesa que el test resuelve cuando quiere: la «latencia» del servidor. */
function espera() {
  let seguir = () => {}
  const promesa = new Promise<void>((resolver) => (seguir = resolver))
  return { promesa, seguir }
}

/**
 * La zona de socios en pequeño: un loader que lee la cesta «del servidor» y
 * una action que la cambia, con el resumen y la lista en la misma página.
 * aceptar decide, cuando el test quiera, si el servidor acepta el cambio.
 * La página enseña cuántas veces se ha ejecutado el loader: así el test sabe
 * cuándo han terminado la action y la revalidación.
 */
function montarCesta(aceptar: () => Promise<boolean>) {
  let enElServidor: Cesta = {}
  let cargas = 0
  function Pagina() {
    const { cesta, cargas } = useLoaderData() as { cesta: Cesta; cargas: number }
    return (
      <>
        <ResumenCesta cesta={cesta} productos={productos} />
        <ListaCesta cesta={cesta} productos={productos} />
        <p>{`Cargas del loader: ${cargas}`}</p>
      </>
    )
  }
  const Stub = createRoutesStub([
    {
      path: '/socio',
      Component: Pagina,
      loader: () => ({ cesta: enElServidor, cargas: ++cargas }),
      // Como la action de verdad: solo guarda la cesta si el cambio vale.
      async action({ request }) {
        const cesta = cestaDelFormulario(await request.formData(), productos)
        if (!cesta || !(await aceptar())) {
          return data({ ok: false, error: 'No hemos podido cambiar la cesta. Recarga la página y vuelve a probar.' }, { status: 400 })
        }
        enElServidor = cesta
        return { ok: true }
      },
    },
  ])
  const { unmount } = render(<Stub initialEntries={['/socio']} />)
  // Desmonta la página y la vuelve a montar con el mismo servidor de mentira:
  // su loader se ejecuta otra vez y enseña lo que el servidor tiene guardado.
  function recargar() {
    unmount()
    render(<Stub initialEntries={['/socio']} />)
  }
  return { usuario: userEvent.setup(), recargar }
}

/** FormularioPedido con lo que devolvió la action, como en la página del pedido. */
function FormularioConActionData() {
  const actionData = useActionData() as ResultadoPedido | undefined
  return <FormularioPedido token="token-de-prueba" resultado={actionData} />
}

const cantidad = (nombre: string) => screen.getByRole('status', { name: `Cantidad de ${nombre}` })

describe('Paso 9: probar los componentes con createRoutesStub', () => {
  it('la cesta cambia en cuanto pulsas, antes de que responda el servidor, y el resumen también', async () => {
    const servidor = espera()
    const { usuario } = montarCesta(async () => {
      await servidor.promesa
      return true
    })

    await usuario.click(await screen.findByRole('button', { name: 'Añadir Borraja' }))
    await usuario.click(screen.getByRole('button', { name: 'Añadir Borraja' }))
    await usuario.click(screen.getByRole('button', { name: 'Añadir Huevos camperos' }))

    // El servidor todavía no ha respondido a nada.
    expect(cantidad('Borraja')).toHaveTextContent('2')
    expect(cantidad('Huevos camperos')).toHaveTextContent('1')
    expect(screen.getByText('Total: 8,40 €')).toBeInTheDocument()
    expect(screen.getByText(/3 productos · 8,40/)).toBeInTheDocument()

    servidor.seguir()
    // La revalidación tras la action vuelve a ejecutar el loader: la segunda
    // carga. Entonces la cesta que se pinta ya es la del servidor, y es la misma.
    expect(await screen.findByText('Cargas del loader: 2')).toBeInTheDocument()
    expect(cantidad('Borraja')).toHaveTextContent('2')
    expect(cantidad('Huevos camperos')).toHaveTextContent('1')
    expect(screen.getByText('Total: 8,40 €')).toBeInTheDocument()
    expect(screen.getByText(/3 productos · 8,40/)).toBeInTheDocument()
  })

  it('si el servidor rechaza el cambio, la cesta vuelve a como estaba, sale el error y no se guarda nada', async () => {
    const { usuario, recargar } = montarCesta(async () => false)
    await usuario.click(await screen.findByRole('button', { name: 'Añadir Pan de cinta' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No hemos podido cambiar la cesta.')
    expect(cantidad('Pan de cinta')).toHaveTextContent('0')
    expect(screen.getByText(/Tu cesta/).closest('p')).toHaveTextContent('Tu cesta: vacía')

    // Tras un 400 no hay revalidación: lo de arriba es la cesta que ya había en
    // pantalla. Para ver lo que guardó el servidor, se vuelve a cargar la página.
    recargar()
    expect(await screen.findByText('Cargas del loader: 2')).toBeInTheDocument()
    expect(cantidad('Pan de cinta')).toHaveTextContent('0')
    expect(screen.getByText(/Tu cesta/).closest('p')).toHaveTextContent('Tu cesta: vacía')
  })

  it('el formulario del pedido enseña los errores de la action junto a cada campo y lleva el foco al primero', async () => {
    const ERROR = 'Escribe un teléfono de nueve cifras, sin espacios: 612345678.'
    const Stub = createRoutesStub([
      {
        path: '/socio/pedido',
        Component: FormularioConActionData,
        // Una action de mentira con la misma forma que la de verdad.
        async action({ request }) {
          const valores = Object.fromEntries(await request.formData()) as ResultadoPedido['valores']
          return data({ errores: { telefono: [ERROR] }, valores }, { status: 400 })
        },
      },
    ])
    render(<Stub initialEntries={['/socio/pedido']} />)
    const usuario = userEvent.setup()

    const donde = await screen.findByRole('group', { name: 'Dónde la recogerás' })
    await usuario.click(within(donde).getByLabelText(/Actur/))
    await usuario.click(screen.getByLabelText(/jueves/))
    const telefono = screen.getByLabelText('Teléfono para avisarte si falta algo')
    await usuario.type(telefono, '12345')
    await usuario.click(screen.getByRole('button', { name: 'Confirmar el pedido' }))

    expect(await screen.findByText(ERROR)).toBeInTheDocument()
    expect(telefono).toHaveAttribute('aria-invalid', 'true')
    expect(telefono).toHaveAccessibleDescription(ERROR)
    expect(telefono).toHaveFocus()
    // Con JavaScript, el formulario no se vuelve a montar: lo escrito sigue ahí.
    expect(telefono).toHaveValue('12345')
    expect(within(donde).getByLabelText(/Actur/)).toBeChecked()
  })
})
