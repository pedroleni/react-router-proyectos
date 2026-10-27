import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Aviso } from '~/tipos'
import { hoyEnSahagun } from '~/fechas'

function archivoAvisos(): string {
  return process.env.ARCHIVO_AVISOS ?? join(process.cwd(), 'datos', 'avisos.json')
}

export async function leerAviso(): Promise<Aviso | null> {
  try {
    const aviso = JSON.parse(await readFile(archivoAvisos(), 'utf8')) as Aviso
    return aviso.hasta >= hoyEnSahagun() ? aviso : null
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

let colaDeEscritura = Promise.resolve()

export function guardarAviso(aviso: Aviso): Promise<void> {
  // L16: la cola ordena escrituras dentro de este proceso; con varios procesos
  // haría falta una base de datos para coordinarlos.
  const operacion = colaDeEscritura.then(async () => {
    const archivo = archivoAvisos()
    await mkdir(dirname(archivo), { recursive: true })
    const temporal = `${archivo}.${randomUUID()}.tmp`
    // L16: rename publica el JSON completo de una vez y evita lecturas parciales.
    await writeFile(temporal, JSON.stringify(aviso, null, 2), 'utf8')
    await rename(temporal, archivo)
  })
  colaDeEscritura = operacion.catch(() => undefined)
  return operacion
}
