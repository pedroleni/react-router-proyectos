import { href, Link } from 'react-router'
import { totalDeCesta, unidadesDeCesta, useCestaOptimista } from '~/cesta'
import { formatearEuros } from '~/dinero'
import type { Cesta, Producto } from '~/tipos'

/**
 * «Tu cesta: 5 productos · 14,30 €», arriba en toda la zona de socios. Lee el
 * mismo fetcher que la lista (la key de useCestaOptimista), así que cambia en
 * cuanto pulsas un botón, sin esperar al servidor.
 */
export default function ResumenCesta({ cesta, productos }: { cesta: Cesta; productos: Producto[] }) {
  const { cesta: optimista } = useCestaOptimista(cesta, productos)
  const unidades = unidadesDeCesta(optimista)
  return (
    <p className="resumen-cesta" aria-live="polite">
      <Link to={href('/socio')}>Tu cesta</Link>:{' '}
      {unidades === 0
        ? 'vacía'
        : `${unidades} ${unidades === 1 ? 'producto' : 'productos'} · ${formatearEuros(totalDeCesta(optimista, productos))}`}
    </p>
  )
}
