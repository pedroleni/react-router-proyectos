import { useEffect, useState } from 'react'
import { data, href, isRouteErrorResponse, Link } from 'react-router'
import { z } from 'zod/mini'
import { buscarEtapa } from '~/datos/etapas'
import { anadirAMiCamino } from '~/mi-camino'
import type { Route } from './+types/etapa'

export async function loader({ params }: Route.LoaderArgs) {
  const etapa = buscarEtapa(params.etapa)
  // L15: data corta la ruta con un 404 real; la frontera valida el cuerpo porque llega como any.
  if (!etapa) throw data({ mensaje: 'No conocemos esa etapa del Camino.' }, { status: 404 })
  return { etapa }
}

let cache: { clave: string; caduca: number; datos: Awaited<ReturnType<typeof loader>> } | undefined
export async function clientLoader({ params, serverLoader }: Route.ClientLoaderArgs) {
  // L16: el slug es la clave y el dato dura cinco minutos; después se vuelve al servidor.
  const clave = params.etapa ?? ''
  if (cache?.clave === clave && cache.caduca > Date.now()) return cache.datos
  const datos = await serverLoader()
  cache = { clave, caduca: Date.now() + 5 * 60 * 1000, datos }
  return datos
}
clientLoader.hydrate = true as const
// L16: hydrate ceba esta caché al arrancar; sin HydrateFallback se conserva el HTML del loader en SSR.

export default function Etapa({ loaderData }: Route.ComponentProps) {
  const { etapa } = loaderData
  const [cliente, setCliente] = useState(false)
  const [anadida, setAnadida] = useState(false)
  useEffect(() => setCliente(true), [])
  return (
    <main className="pagina estrecha etapa-detalle">
      <title>{`${etapa.origen} a ${etapa.destino} | El Cea`}</title>
      <Link to={href('/etapas')}>Volver a las etapas</Link>
      <h1>
        {etapa.origen} <span>hasta</span> {etapa.destino}
      </h1>
      <p className="distancia">{String(etapa.kilometros).replace('.', ',')} km aproximados</p>
      <p>{etapa.descripcion}</p>
      <p>Antes de caminar, revisa el tiempo, lleva agua y confirma los servicios abiertos en la ruta.</p>
      {cliente ? (
        <button
          type="button"
          disabled={anadida}
          onClick={() => {
            anadirAMiCamino(etapa.slug)
            setAnadida(true)
          }}
        >
          {anadida ? 'Añadida a mi camino' : 'Añadir a mi camino'}
        </button>
      ) : null}
    </main>
  )
}

const ErrorEtapa = z.object({ mensaje: z.string() })
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  // L16: zod/mini basta para esta validación y evita enviar Zod completo al navegador.
  const validado = isRouteErrorResponse(error) ? ErrorEtapa.safeParse(error.data) : null
  const mensaje = validado?.success ? validado.data.mensaje : 'No hemos podido mostrar esta etapa.'
  const noEncontrada = isRouteErrorResponse(error) && error.status === 404
  const titulo = noEncontrada ? 'Etapa no encontrada' : 'Error al mostrar la etapa'
  return (
    <main className="pagina estrecha">
      <title>{titulo} | El Cea</title>
      <h1>{titulo}</h1>
      <p>{mensaje}</p>
      <Link to={href('/etapas')}>Ver todas las etapas</Link>
    </main>
  )
}
