import {
  data,
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { enviarJson, ErrorApi, pedirJson } from '../api'
import Campo, { propsDeError } from '../componentes/Campo'
import type { Alumno, ErroresPrestamo, Libro } from '../tipos'

// Los alumnos y los libros con ejemplares libres, a la vez. Como en la
// versión 6, si fallan los libros el formulario sale con la lista vacía.
export async function loader({ request }: LoaderFunctionArgs) {
  const opciones = { signal: request.signal }
  const [alumnos, libros] = await Promise.all([
    pedirJson<Alumno[]>('/api/alumnos', opciones),
    pedirJson<Libro[]>('/api/libros?disponibles=1', opciones).catch(() => []),
  ])
  return { alumnos, libros }
}

export async function action({ request }: ActionFunctionArgs) {
  const datos = await request.formData()
  const respuesta = await enviarJson(
    '/api/prestamos',
    'POST',
    {
      alumnoId: Number(datos.get('alumnoId')),
      libroId: Number(datos.get('libroId')),
      dias: Number(datos.get('dias')),
    },
    request.signal,
  )
  // Los errores de validación se devuelven, no se lanzan: son parte de la página.
  if (respuesta.status === 400) {
    const { errores } = (await respuesta.json()) as { errores: ErroresPrestamo }
    return data({ errores }, { status: 400 })
  }
  if (!respuesta.ok) throw new ErrorApi(respuesta.status)
  return redirect('/prestamos')
}

export function Component() {
  const { alumnos, libros } = useLoaderData<typeof loader>()
  const errores = useActionData<typeof action>()?.errores ?? {}
  const enviando = useNavigation().state === 'submitting'

  return (
    <section className="estrecha">
      <p className="migas">
        <Link to="/prestamos">Volver a los préstamos</Link>
      </p>
      <h1>Nuevo préstamo</h1>
      <Form method="post" className="formulario" noValidate>
        <Campo id="alumnoId" etiqueta="Alumno o alumna" error={errores.alumnoId}>
          <select id="alumnoId" name="alumnoId" defaultValue="" {...propsDeError('alumnoId', errores.alumnoId)}>
            <option value="">Elige…</option>
            {alumnos.map((alumno) => (
              <option key={alumno.id} value={alumno.id}>
                {alumno.nombre} ({alumno.curso})
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="libroId" etiqueta="Libro" error={errores.libroId}>
          <select id="libroId" name="libroId" defaultValue="" {...propsDeError('libroId', errores.libroId)}>
            <option value="">Elige…</option>
            {libros.map((libro) => (
              <option key={libro.id} value={libro.id}>
                {libro.titulo} ({libro.disponibles} disponibles)
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="dias" etiqueta="Plazo" error={errores.dias}>
          <select id="dias" name="dias" defaultValue="14" {...propsDeError('dias', errores.dias)}>
            <option value="7">7 días</option>
            <option value="14">14 días</option>
            <option value="21">21 días</option>
          </select>
        </Campo>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Registrando…' : 'Registrar el préstamo'}
        </button>
      </Form>
    </section>
  )
}

export function ErrorBoundary() {
  return (
    <p role="alert" className="aviso-error">
      No se ha podido preparar el préstamo.
    </p>
  )
}
