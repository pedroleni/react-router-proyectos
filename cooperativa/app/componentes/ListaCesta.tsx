import { totalDeCesta, useCestaOptimista } from '~/cesta'
import { formatearEuros } from '~/dinero'
import type { Cesta, Producto } from '~/tipos'

/**
 * El catálogo con los botones para llenar la cesta. Es un solo formulario y un
 * solo fetcher para toda la lista: cada botón envía la cesta entera (un campo
 * oculto por producto) y su cambio. Si pulsas otro botón antes de que llegue
 * la respuesta, React Router cancela el envío anterior, y el nuevo ya lleva
 * los dos cambios. Sin JavaScript, es un formulario normal.
 */
export default function ListaCesta({ cesta, productos }: { cesta: Cesta; productos: Producto[] }) {
  const { fetcher, cesta: optimista } = useCestaOptimista(cesta, productos)
  const error = fetcher.state === 'idle' && fetcher.data && !fetcher.data.ok ? fetcher.data.error : null

  return (
    <fetcher.Form method="post" className="lista-cesta">
      <ul>
        {productos.map((producto) => {
          const cantidad = optimista[producto.id] ?? 0
          return (
            <li key={producto.id} className={cantidad > 0 ? 'fila-producto en-la-cesta' : 'fila-producto'}>
              <input type="hidden" name={`cantidad-${producto.id}`} value={cantidad} />
              <div className="fila-datos">
                <h2>{producto.nombre}</h2>
                <p>
                  {producto.formato} · {formatearEuros(producto.precio)}
                </p>
              </div>
              <div className="fila-botones">
                <button
                  type="submit"
                  name="cambio"
                  value={`restar:${producto.id}`}
                  aria-label={`Quitar ${producto.nombre}`}
                  disabled={cantidad === 0}
                >
                  −
                </button>
                <output className="cantidad" aria-label={`Cantidad de ${producto.nombre}`}>
                  {cantidad}
                </output>
                <button
                  type="submit"
                  name="cambio"
                  value={`sumar:${producto.id}`}
                  aria-label={`Añadir ${producto.nombre}`}
                  disabled={cantidad >= producto.maximo}
                >
                  +
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <div className="cesta-pie">
        <p className="total">Total: {formatearEuros(totalDeCesta(optimista, productos))}</p>
        <button type="submit" name="cambio" value="vaciar" className="enlace" disabled={Object.keys(optimista).length === 0}>
          Vaciar la cesta
        </button>
      </div>
    </fetcher.Form>
  )
}
