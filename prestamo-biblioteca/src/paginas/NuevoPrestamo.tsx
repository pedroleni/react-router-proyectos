import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { enviarJson, ErrorApi, pedirJson } from '../api'
import Campo, { propsDeError } from '../componentes/Campo'
import type { Alumno, ErroresPrestamo, Libro } from '../tipos'

export default function NuevoPrestamo() {
  const navigate = useNavigate()
  const [alumnos, setAlumnos] = useState<Alumno[] | null>(null)
  const [error, setError] = useState(false)
  const [errores, setErrores] = useState<ErroresPrestamo>({})
  const [enviando, setEnviando] = useState(false)

  // TODO (paso 3.6): un loader en vez de este efecto.
  useEffect(() => {
    let ignorar = false
    pedirJson<Alumno[]>('/api/alumnos')
      .then((datos) => {
        if (!ignorar) setAlumnos(datos)
      })
      .catch(() => {
        if (!ignorar) setError(true)
      })
    return () => {
      ignorar = true
    }
  }, [])

  // TODO (paso 3.6): una action en vez de onSubmit y fetch.
  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    setEnviando(true)
    try {
      const respuesta = await enviarJson('/api/prestamos', 'POST', {
        alumnoId: Number(datos.get('alumnoId')),
        libroId: Number(datos.get('libroId')),
        dias: Number(datos.get('dias')),
      })
      if (respuesta.status === 400) {
        const cuerpo = (await respuesta.json()) as { errores: ErroresPrestamo }
        setErrores(cuerpo.errores)
        return
      }
      if (!respuesta.ok) throw new ErrorApi(respuesta.status)
      navigate('/prestamos')
    } catch {
      setError(true)
    } finally {
      setEnviando(false)
    }
  }

  if (error) {
    return (
      <p role="alert" className="aviso-error">
        No se ha podido preparar el préstamo.
      </p>
    )
  }
  if (!alumnos) return <p className="cargando">Cargando…</p>

  return (
    <section className="estrecha">
      <p className="migas">
        <Link to="/prestamos">Volver a los préstamos</Link>
      </p>
      <h1>Nuevo préstamo</h1>
      <form className="formulario" onSubmit={manejarEnvio} noValidate>
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
        <SelectorLibro error={errores.libroId} />
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
      </form>
    </section>
  )
}

// Solo los libros con algún ejemplar libre.
// TODO (paso 3.6): esta petición, en el loader y en paralelo con la de los alumnos.
function SelectorLibro({ error }: { error?: string }) {
  const [libros, setLibros] = useState<Libro[] | null>(null)

  useEffect(() => {
    let ignorar = false
    pedirJson<Libro[]>('/api/libros?disponibles=1')
      .then((datos) => {
        if (!ignorar) setLibros(datos)
      })
      .catch(() => {
        if (!ignorar) setLibros([])
      })
    return () => {
      ignorar = true
    }
  }, [])

  if (!libros) return <p className="cargando">Cargando los libros…</p>

  return (
    <Campo id="libroId" etiqueta="Libro" error={error}>
      <select id="libroId" name="libroId" defaultValue="" {...propsDeError('libroId', error)}>
        <option value="">Elige…</option>
        {libros.map((libro) => (
          <option key={libro.id} value={libro.id}>
            {libro.titulo} ({libro.disponibles} disponibles)
          </option>
        ))}
      </select>
    </Campo>
  )
}
