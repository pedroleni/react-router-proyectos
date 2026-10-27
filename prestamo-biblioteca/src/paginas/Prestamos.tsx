import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { enviarJson, pedirJson } from '../api'
import { fechaLarga } from '../formato'
import type { Prestamo } from '../tipos'

export default function Prestamos() {
  const [prestamos, setPrestamos] = useState<Prestamo[] | null>(null)
  const [error, setError] = useState(false)
  const [recarga, setRecarga] = useState(0)

  // TODO (paso 3.5): un loader en vez de este efecto.
  useEffect(() => {
    let ignorar = false
    pedirJson<Prestamo[]>('/api/prestamos')
      .then((datos) => {
        if (!ignorar) setPrestamos(datos)
      })
      .catch(() => {
        if (!ignorar) setError(true)
      })
    return () => {
      ignorar = true
    }
  }, [recarga])

  // TODO (paso 3.5): una action en vez de este manejador; los datos se recargan solos.
  async function devolver(prestamo: Prestamo) {
    const respuesta = await enviarJson(`/api/prestamos/${prestamo.id}/devolucion`, 'POST')
    if (!respuesta.ok) {
      setError(true)
      return
    }
    setRecarga((n) => n + 1)
  }

  if (error) {
    return (
      <p role="alert" className="aviso-error">
        No se han podido cargar los préstamos.
      </p>
    )
  }
  if (!prestamos) return <p className="cargando">Cargando los préstamos…</p>

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
            <button type="button" className="boton-secundario" onClick={() => devolver(prestamo)}>
              Devolver{' '}
              <span className="visualmente-oculto">
                «{prestamo.titulo}», de {prestamo.alumno}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
