import { href, Link } from 'react-router'
import { productosDeLaSemana, SEMANA } from '~/datos/catalogo.server'
import { formatearEuros } from '~/dinero'
import type { Route } from './+types/catalogo'

// El catálogo público. Cambia cada semana, así que no se prerenderiza: se
// genera en el servidor y se deja guardar en una caché.
export async function loader() {
  return { semana: SEMANA, productos: productosDeLaSemana() }
}

// La página es la misma para todo el mundo: puede guardarla el navegador
// (max-age, 5 minutos) y una caché compartida, como la de un CDN (s-maxage,
// 1 hora). Nunca en una página que lleve datos de alguien.
export function headers(_: Route.HeadersArgs) {
  // TODO (paso 6): devuelve la cabecera Cache-Control para que el navegador
  // guarde la página 5 minutos (max-age=300) y una caché compartida 1 hora
  // (s-maxage=3600). public: no lleva datos de nadie.
  return {}
}

export default function Catalogo({ loaderData }: Route.ComponentProps) {
  const { semana, productos } = loaderData
  return (
    <main className="pagina">
      <title>{`Catálogo de la semana ${semana.numero} · La Huerta del Ebro`}</title>
      <meta name="description" content={`Lo que hay esta semana en la huerta. Recogida el ${semana.recogida}.`} />
      <h1>Catálogo de la semana {semana.numero}</h1>
      <p className="entradilla">
        Pedidos hasta el {semana.cierre}. Recogida el {semana.recogida}.
      </p>
      <ul className="catalogo">
        {productos.map((producto) => (
          <li key={producto.id} className="tarjeta-producto">
            <h2>{producto.nombre}</h2>
            <p className="formato">{producto.formato}</p>
            <p className="origen">De {producto.origen}</p>
            <p className="precio">{formatearEuros(producto.precio)}</p>
          </li>
        ))}
      </ul>
      <p className="acciones">
        <Link to={href('/socio')} className="boton">
          Entrar para hacer mi pedido
        </Link>
      </p>
    </main>
  )
}
