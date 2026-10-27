import { data } from 'react-router'
import { aCsv } from '~/csv'
import { reservasDeNoche } from '~/datos/reservas.server'
import { FechaIsoReal, hoyEnSahagun } from '~/fechas'
import type { Route } from './+types/pernoctas-csv'

export async function loader({ request }: Route.LoaderArgs) {
  const recibida = new URL(request.url).searchParams.get('noche')
  const validada = FechaIsoReal.safeParse(recibida ?? hoyEnSahagun())
  if (!validada.success) throw data({ mensaje: 'La noche no es una fecha válida.' }, { status: 400 })
  const noche = validada.data
  const reservas = (await reservasDeNoche(noche)).filter((reserva) => reserva.estado !== 'anulada')
  const filas: (string | number)[][] = [['Noche', 'Nombre', 'Documento', 'Personas', 'Estado']]
  for (const reserva of reservas)
    filas.push([reserva.noche, reserva.nombre, reserva.documento, reserva.personas, reserva.estado])
  return new Response(aCsv(filas), {
    headers: {
      // L19: una ruta de recurso entrega el archivo, no renderiza una pantalla;
      // Content-Disposition hace que el navegador lo descargue con este nombre.
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="pernoctas-${noche}.csv"`,
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
