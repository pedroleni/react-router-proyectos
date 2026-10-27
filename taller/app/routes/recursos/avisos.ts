import { timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { tokenDeAvisos } from '~/config.server'
import { guardarAviso } from '~/datos/avisos.server'
import { informarError } from '~/errores.server'
import type { Route } from './+types/avisos'

const Aviso = z.object({
  tipo: z.enum(['corte-agua', 'fiesta']),
  texto: z.string().trim().min(1).max(280),
  hasta: z.iso.date(),
})

// L19/L22: allowedActionOrigins no se aplica a rutas de recursos y solo mira el
// Origin que manda un navegador; este sistema externo autentica su POST con token.
export function loader() {
  return new Response('Método no permitido.', { status: 405, headers: { Allow: 'POST' } })
}

function tokenCorrecto(recibido: string, esperado: string): boolean {
  const a = Buffer.from(recibido)
  const b = Buffer.from(esperado)
  // La comparación constante no filtra caracteres; la longitud sigue siendo visible.
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST')
    return new Response('Método no permitido.', { status: 405, headers: { Allow: 'POST' } })
  let esperado: string
  try {
    esperado = tokenDeAvisos()
  } catch (error) {
    informarError(error, { url: request.url, metodo: request.method })
    // 503 indica configuración ausente; 401 se reserva para credenciales incorrectas.
    return new Response('Servicio no configurado.', { status: 503 })
  }
  const autorizacion = request.headers.get('Authorization') ?? ''
  const recibido = autorizacion.startsWith('Bearer ') ? autorizacion.slice(7) : ''
  if (!tokenCorrecto(recibido, esperado)) return new Response('No autorizado.', { status: 401 })
  let cuerpo: unknown
  try {
    cuerpo = await request.json()
  } catch {
    return Response.json({ error: 'El cuerpo no es JSON válido.' }, { status: 400 })
  }
  const resultado = Aviso.safeParse(cuerpo)
  if (!resultado.success)
    return Response.json({ error: 'El aviso no tiene el formato esperado.' }, { status: 400 })
  await guardarAviso(resultado.data)
  return Response.json({ guardado: true }, { status: 201 })
}
