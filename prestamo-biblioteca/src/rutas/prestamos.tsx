import { data, Form, Link, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { enviarJson, pedirJson } from '../api'
import { fechaLarga } from '../formato'
import type { Prestamo } from '../tipos'

export async function loader({ request }: LoaderFunctionArgs) {
  return { prestamos: await pedirJson<Prestamo[]>('/api/prestamos', { signal: request.signal }) }
}

// «Devolver» envía aquí. Al terminar, el router vuelve a ejecutar el loader:
// la lista se actualiza sola, sin recargas a mano.
export async function action({ request }: ActionFunctionArgs) {
  const id = (await request.formData()).get('id')
  const respuesta = await enviarJson(`/api/prestamos/${id}/devolucion`, 'POST', undefined, request.signal)
  if (!respuesta.ok) throw data('No se ha podido devolver el libro', { status: respuesta.status })
  return null
}

export function Component() {
  const { prestamos } = useLoaderData<typeof loader>()
  const vencidos = prestamos.filter((p) => p.vencido).length

  return (
    <section>
      <div className="titulo-con-accion">
        <h1>Préstamos activos</h1>
        <Link to="/prestamos/nuevo" className="boton">
          Nuevo préstamo
        </Link>
      </div>
      <p className="resumen">
        {prestamos.length} préstamos activos · {vencidos} vencidos
      </p>
      <ul className="prestamos">
        {prestamos.map((prestamo) => (
          <li key={prestamo.id} className={prestamo.vencido ? 'prestamo vencido' : 'prestamo'}>
            <span className="prestamo-titulo">{prestamo.titulo}</span>
            <span className="prestamo-alumno">
              {prestamo.alumno} ({prestamo.curso})
            </span>
            <span className="prestamo-fecha">
              {prestamo.ejemplar} · hasta el {fechaLarga(prestamo.hasta)}
            </span>
            {prestamo.vencido && <span className="etiqueta">Vencido</span>}
            <Form method="post">
              <input type="hidden" name="id" value={prestamo.id} />
              <button type="submit" className="boton-secundario">
                Devolver{' '}
                <span className="visualmente-oculto">
                  «{prestamo.titulo}», de {prestamo.alumno}
                </span>
              </button>
            </Form>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ErrorBoundary() {
  return (
    <p role="alert" className="aviso-error">
      No se han podido cargar los préstamos.
    </p>
  )
}
