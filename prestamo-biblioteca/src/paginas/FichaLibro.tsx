import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorApi, pedirJson } from '../api'
import { fechaLarga } from '../formato'
import type { Ejemplar, Libro } from '../tipos'

type Estado = 'cargando' | 'listo' | 'no-existe' | 'error'

export default function FichaLibro() {
  const { id } = useParams()
  const [libro, setLibro] = useState<Libro | null>(null)
  const [estado, setEstado] = useState<Estado>('cargando')

  // TODO (paso 3.4): un loader en vez de este efecto, y el 404 en un ErrorBoundary.
  useEffect(() => {
    let ignorar = false
    setEstado('cargando')
    pedirJson<Libro>(`/api/libros/${id}`)
      .then((datos) => {
        if (ignorar) return
        setLibro(datos)
        setEstado('listo')
      })
      .catch((error: unknown) => {
        if (ignorar) return
        setEstado(error instanceof ErrorApi && error.estado === 404 ? 'no-existe' : 'error')
      })
    return () => {
      ignorar = true
    }
  }, [id])

  if (estado === 'no-existe') {
    return (
      <section>
        <h1>No hemos encontrado ese libro</h1>
        <p>
          <Link to="/catalogo">Volver al catálogo</Link>
        </p>
      </section>
    )
  }
  if (estado === 'error') {
    return (
      <p role="alert" className="aviso-error">
        No se ha podido cargar el libro.
      </p>
    )
  }
  if (estado === 'cargando' || !libro) return <p className="cargando">Cargando el libro…</p>

  return (
    <article className="ficha">
      <p className="migas">
        <Link to="/catalogo">Volver al catálogo</Link>
      </p>
      <h1>{libro.titulo}</h1>
      <p className="ficha-autor">{libro.autor}</p>
      <dl className="ficha-datos">
        <dt>Estantería</dt>
        <dd>{libro.estanteria}</dd>
        <dt>Disponibles</dt>
        <dd>
          {libro.disponibles} de {libro.ejemplares} ejemplares
        </dd>
      </dl>
      <h2>Ejemplares</h2>
      <Ejemplares libroId={libro.id} />
    </article>
  )
}

// Cada ejemplar, con la fecha en que vuelve si está prestado.
// TODO (paso 3.4): esta petición, en el loader de la ficha y en paralelo con la del libro.
function Ejemplares({ libroId }: { libroId: number }) {
  const [ejemplares, setEjemplares] = useState<Ejemplar[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let ignorar = false
    pedirJson<Ejemplar[]>(`/api/libros/${libroId}/ejemplares`)
      .then((datos) => {
        if (!ignorar) setEjemplares(datos)
      })
      .catch(() => {
        if (!ignorar) setError(true)
      })
    return () => {
      ignorar = true
    }
  }, [libroId])

  if (error) {
    return (
      <p role="alert" className="aviso-error">
        No se han podido cargar los ejemplares.
      </p>
    )
  }
  if (!ejemplares) return <p className="cargando">Cargando los ejemplares…</p>

  return (
    <ul className="ejemplares">
      {ejemplares.map((ejemplar) => (
        <li key={ejemplar.codigo} className={ejemplar.prestadoHasta ? 'prestado' : 'libre'}>
          <span className="codigo">{ejemplar.codigo}</span>
          {ejemplar.prestadoHasta ? `prestado hasta el ${fechaLarga(ejemplar.prestadoHasta)}` : 'disponible'}
        </li>
      ))}
    </ul>
  )
}
