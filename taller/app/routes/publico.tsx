import { href, Link, NavLink, Outlet } from 'react-router'

export default function Publico() {
  return (
    <div className="sitio">
      <header className="cabecera">
        <Link className="marca" to={href('/')}>
          <span>El Cea</span>
          <small>Albergue de peregrinos</small>
        </Link>
        <nav aria-label="Principal" className="menu">
          <NavLink to={href('/albergue')}>El albergue</NavLink>
          <NavLink to={href('/etapas')}>Etapas</NavLink>
          <NavLink to={href('/mi-camino')}>Mi camino</NavLink>
          <NavLink to={href('/camas')}>Camas</NavLink>
          <NavLink className="menu-reservar" to={href('/reservar')}>
            Reservar
          </NavLink>
        </nav>
      </header>
      <Outlet />
      <footer className="pie">
        <p>
          <strong>Albergue El Cea</strong>
          <br />
          Sahagún, León. Camino Francés.
        </p>
        <p>
          <Link to={href('/entrar')}>Zona de hospitaleros</Link>
        </p>
      </footer>
    </div>
  )
}
