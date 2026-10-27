import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { pedirJson } from '../api'
import type { Libro } from '../tipos'

export default function Catalogo() {
  const [parametros, setParametros] = useSearchParams()
  const q = parametros.get('q') ?? ''
  const [libros, setLibros] = useState<Libro[] | null>(null)
  const [error, setError] = useState(false)

  // TODO (paso 3.3): un loader en vez de este efecto.
  useEffect(() => {
    let ignorar = false
    setLibros(null)
    setError(false)
    pedirJson<Libro[]>(`/api/libros?q=${encodeURIComponent(q)}`)
      .then((datos) => {
        if (!ignorar) setLibros(datos)
      })
      .catch(() => {
        if (!ignorar) setError(true)
      })
    return () => {
      ignorar = true
    }
  }, [q])

  // TODO (paso 3.3): un <Form method="get"> en vez de este manejador.
  function manejarBusqueda(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const texto = String(new FormData(evento.currentTarget).get('q') ?? '').trim()
    setParametros(texto ? { q: texto } : {})
  }

  return (
    <section>
      <h1>Catálogo</h1>
      <form role="search" className="busqueda" onSubmit={manejarBusqueda}>
        <label htmlFor="q">Título o autor</label>
        <input id="q" name="q" type="search" defaultValue={q} key={q} />
        <button type="submit">Buscar</button>
      </form>
      {error ? (
        <p role="alert" className="aviso-error">
          No se ha podido cargar el catálogo.
        </p>
      ) : !libros ? (
        <p className="cargando">Cargando el catálogo…</p>
      ) : libros.length === 0 ? (
        <p>No hay libros que coincidan con «{q}».</p>
      ) : (
        <ul className="libros">
          {libros.map((libro) => (
            <li key={libro.id} className="libro">
              <Link to={`/catalogo/${libro.id}`} className="libro-titulo">
                {libro.titulo}
              </Link>
              <span className="libro-autor">{libro.autor}</span>
              <span className={libro.disponibles > 0 ? 'disponibles' : 'disponibles agotado'}>
                {libro.disponibles} de {libro.ejemplares} disponibles
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
