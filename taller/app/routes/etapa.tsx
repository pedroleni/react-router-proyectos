import { Link, useLoaderData } from 'react-router'
import { buscarEtapa } from '~/datos/etapas'

// TODO (lección 15): usa Route.LoaderArgs y lanza data(..., { status: 404 })
// cuando el slug no exista. Busca Route Module Type Safety.
export async function loader({ params }) {
  return { etapa: buscarEtapa(params.etapa) }
}

export async function clientLoader({ serverLoader }: { serverLoader: () => Promise<unknown> }) {
  // TODO (lección 16): cachea serverLoader durante cinco minutos y activa la
  // hidratación. Busca clientLoader.hydrate.
  // Mientras no haya caché, una navegación cliente debe seguir usando el loader que ya funciona.
  return serverLoader()
}
clientLoader.hydrate = false as const

export default function Etapa(_props: Record<string, unknown>) {
  // TODO (lección 15): recibe Route.ComponentProps y usa loaderData tipado.
  const { etapa } = useLoaderData()
  return (
    <main className="pagina estrecha etapa-detalle">
      <Link to="/etapas">Volver a las etapas</Link>
      <h1>
        {etapa.origen} hasta {etapa.destino}
      </h1>
      <p>{String(etapa.kilometros).replace('.', ',')} km aproximados</p>
      <p>{etapa.descripcion}</p>
    </main>
  )
}

export function ErrorBoundary(_props: {
  error: unknown
  params?: Record<string, string>
}): React.ReactElement {
  // TODO (lección 15): estrecha con isRouteErrorResponse y valida error.data
  // antes de mostrarlo. Busca Error Boundaries y Route.ErrorBoundaryProps.
  throw new Error('TODO (lección 15): frontera de error de etapa.')
}
