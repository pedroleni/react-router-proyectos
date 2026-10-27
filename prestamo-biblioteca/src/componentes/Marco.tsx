import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useSesion } from '../sesion'

// La cabecera, el menú y el pie de todas las páginas.
export default function Marco() {
  const { usuario, salir } = useSesion()
  const navigate = useNavigate()
  const [errorAlSalir, setErrorAlSalir] = useState(false)

  // TODO (paso 1): al activar v7_startTransition, prueba en el navegador a cerrar sesión desde /prestamos.
  // TODO (paso 3.2): una action en /salir y un <Form>, en vez de este manejador.
  async function manejarSalir() {
    setErrorAlSalir(false)
    try {
      await salir()
      navigate('/catalogo')
    } catch {
      // La sesión sigue abierta: se queda a la vista, y el botón, para reintentar.
      setErrorAlSalir(true)
    }
  }

  return (
    <div className="marco">
      <header className="cabecera">
        <Link to="/catalogo" className="marca">
          <span className="marca-sello" aria-hidden="true">TA</span>
          Biblioteca del IES Tierras Altas
        </Link>
        <nav aria-label="Principal" className="menu">
          <NavLink to="/catalogo">Catálogo</NavLink>
          <NavLink to="/prestamos">Préstamos</NavLink>
        </nav>
        <div className="sesion">
          {usuario ? (
            <>
              <span className="usuario">{usuario.nombre}</span>
              <button type="button" className="boton-secundario" onClick={manejarSalir}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/entrar">Entrar</Link>
          )}
        </div>
      </header>
      <main className="contenido">
        {errorAlSalir && (
          <p role="alert" className="aviso-error">
            No se ha podido cerrar la sesión. Inténtalo de nuevo.
          </p>
        )}
        <Outlet />
      </main>
      <footer className="pie">Biblioteca del IES Tierras Altas · Soria · Préstamos de lectura</footer>
    </div>
  )
}
