import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  FormDataParseError,
  MaxFileSizeExceededError,
  MaxFilesExceededError,
  MaxTotalSizeExceededError,
  MultipartParseError,
  parseFormData,
  type FileUpload,
} from '@remix-run/form-data-parser'
import { data, Form, href, Link, redirect } from 'react-router'
import { sesionContext } from '~/contexto.server'
import { actualizarReserva, buscarReserva } from '~/datos/reservas.server'
import type { Route } from './+types/reserva'

export async function loader({ params }: Route.LoaderArgs) {
  const reserva = await buscarReserva(params.id)
  if (!reserva) throw data({ mensaje: 'No existe esa reserva.' }, { status: 404 })
  return { reserva }
}

class TipoDeArchivoNoValido extends Error {}
const MAX_CREDENCIAL = 2 * 1024 * 1024

function directorioSubidas(): string {
  return process.env.DIRECTORIO_SUBIDAS ?? join(process.cwd(), 'subidas')
}

function tieneFirma(buffer: Buffer, firma: number[]): boolean {
  return firma.every((byte, indice) => buffer[indice] === byte)
}

async function guardarCredencial(archivo: FileUpload, escritos: string[]): Promise<string | null> {
  if (archivo.fieldName !== 'credencial') return null
  // L19: `type` lo manda el cliente; los bytes mágicos son los que confirman el formato.
  if (archivo.type !== 'image/jpeg' && archivo.type !== 'image/png') throw new TipoDeArchivoNoValido()
  const contenido = Buffer.from(await new Response(archivo.stream()).arrayBuffer())
  if (contenido.length === 0) throw new TipoDeArchivoNoValido()
  const png = tieneFirma(contenido, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const jpeg = tieneFirma(contenido, [0xff, 0xd8, 0xff])
  if ((archivo.type === 'image/png' && !png) || (archivo.type === 'image/jpeg' && !jpeg))
    throw new TipoDeArchivoNoValido()
  const extension = archivo.type === 'image/png' ? '.png' : '.jpg'
  // L19: el UUID evita rutas controladas por el nombre aportado por el navegador.
  const nombre = `${randomUUID()}${extension}`
  await mkdir(directorioSubidas(), { recursive: true })
  await writeFile(join(directorioSubidas(), nombre), contenido)
  escritos.push(nombre)
  return nombre
}

async function borrarSubidas(nombres: string[]): Promise<void> {
  await Promise.all(
    nombres.map((nombre) => unlink(join(directorioSubidas(), nombre)).catch(() => undefined)),
  )
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const reserva = await buscarReserva(params.id)
  if (!reserva) throw data({ mensaje: 'No existe esa reserva.' }, { status: 404 })
  const tipo = request.headers.get('content-type') ?? ''
  if (tipo.startsWith('multipart/form-data')) {
    const escritos: string[] = []
    try {
      // L19: parseFormData limita el flujo antes de cargar más de 2 MB en memoria.
      const formulario = await parseFormData(
        request,
        { maxFileSize: MAX_CREDENCIAL, maxFiles: 1 },
        (archivo) => guardarCredencial(archivo, escritos),
      )
      const credencial = formulario.get('credencial')
      if (typeof credencial !== 'string' || !credencial)
        return data({ error: 'Selecciona una imagen de la credencial.' }, { status: 400 })
      const actualizada = await actualizarReserva(reserva.id, { credencial })
      if (!actualizada) throw data({ mensaje: 'No existe esa reserva.' }, { status: 404 })
      if (reserva.credencial && reserva.credencial !== credencial) await borrarSubidas([reserva.credencial])
      return data({ guardada: true })
    } catch (error) {
      await borrarSubidas(escritos)
      if (error instanceof TipoDeArchivoNoValido)
        return data({ error: 'La credencial debe ser una imagen JPEG o PNG válida.' }, { status: 400 })
      // L19: 413 se reserva para tamaño; los multipart mal formados son peticiones 400.
      if (error instanceof MaxFileSizeExceededError || error instanceof MaxTotalSizeExceededError)
        return data({ error: 'La imagen supera el máximo de 2 MB.' }, { status: 413 })
      if (
        error instanceof MaxFilesExceededError ||
        error instanceof FormDataParseError ||
        error instanceof MultipartParseError
      )
        return data({ error: 'El formulario de subida no es válido.' }, { status: 400 })
      throw error
    }
  }
  if (!tipo.startsWith('application/x-www-form-urlencoded'))
    return data({ error: 'Tipo de contenido no admitido.' }, { status: 415 })
  const formulario = await request.formData()
  if (formulario.get('intencion') !== 'llegada')
    return data({ error: 'Acción no reconocida.' }, { status: 400 })
  if (reserva.estado === 'anulada')
    return data({ error: 'No se puede marcar la llegada de una reserva anulada.' }, { status: 409 })
  await actualizarReserva(reserva.id, { estado: 'llegada' })
  // L18: el flash es breve y no copia texto del usuario para no desbordar la cookie.
  context.get(sesionContext).flash('aviso', 'Llegada marcada.')
  return redirect(href('/hospitaleros'))
}

export default function Reserva({ loaderData, actionData }: Route.ComponentProps) {
  const { reserva } = loaderData
  const error = actionData && 'error' in actionData ? actionData.error : undefined
  const guardada = actionData && 'guardada' in actionData ? actionData.guardada : false
  return (
    <main className="pagina estrecha zona-contenido">
      <title>{`Reserva ${reserva.id} | El Cea`}</title>
      <Link to={href('/hospitaleros')}>Volver a las reservas</Link>
      <h1>{reserva.nombre}</h1>
      <dl className="ficha">
        <div>
          <dt>Noche</dt>
          <dd>{reserva.noche}</dd>
        </div>
        <div>
          <dt>Personas</dt>
          <dd>{reserva.personas}</dd>
        </div>
        <div>
          <dt>Documento</dt>
          <dd>{reserva.documento}</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>{reserva.estado}</dd>
        </div>
      </dl>
      {reserva.estado !== 'llegada' && reserva.estado !== 'anulada' ? (
        <Form method="post">
          <button name="intencion" value="llegada" type="submit">
            Marcar llegada
          </button>
        </Form>
      ) : null}
      <section className="subida">
        <h2>Credencial</h2>
        <p>{reserva.credencial ? 'La foto ya está guardada.' : 'Sube una foto JPEG o PNG de hasta 2 MB.'}</p>
        <Form method="post" encType="multipart/form-data" className="formulario">
          <div className="campo">
            <label htmlFor="credencial">Foto de la credencial</label>
            <input
              id="credencial"
              name="credencial"
              type="file"
              accept="image/jpeg,image/png"
              aria-describedby={error ? 'credencial-error' : undefined}
              required
            />
          </div>
          {error ? (
            <p id="credencial-error" className="error" role="alert">
              {error}
            </p>
          ) : null}
          {guardada ? (
            <p className="confirmacion" role="status">
              Credencial guardada.
            </p>
          ) : null}
          <button type="submit">Guardar foto</button>
        </Form>
      </section>
    </main>
  )
}
