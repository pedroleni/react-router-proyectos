import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Reserva } from '~/tipos'
import { hoyEnSahagun } from '~/fechas'

function reservasIniciales(): Reserva[] {
  const noche = hoyEnSahagun()
  return [
    {
      id: 'r-1',
      noche,
      nombre: 'Aiko Tanaka',
      documento: '***482',
      personas: 1,
      estado: 'reservada',
      credencial: null,
    },
    {
      id: 'r-2',
      noche,
      nombre: 'João Ferreira',
      documento: '***731',
      personas: 2,
      estado: 'llegada',
      credencial: null,
    },
    {
      id: 'r-3',
      noche,
      nombre: 'Élodie Martin',
      documento: '***095',
      personas: 1,
      estado: 'anulada',
      credencial: null,
    },
  ]
}

function archivoReservas(): string {
  return process.env.ARCHIVO_RESERVAS ?? join(process.cwd(), 'datos', 'reservas.json')
}

export async function leerReservas(): Promise<Reserva[]> {
  try {
    const contenido = await readFile(archivoReservas(), 'utf8')
    return JSON.parse(contenido) as Reserva[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return reservasIniciales()
    throw error
  }
}

let colaDeEscritura = Promise.resolve()

// L16: la cola evita carreras solo dentro de este proceso; con varios procesos
// haría falta una base de datos que serializase la transacción.
function enCola<T>(trabajo: () => Promise<T>): Promise<T> {
  const operacion = colaDeEscritura.then(trabajo)
  colaDeEscritura = operacion.then(
    () => undefined,
    () => undefined,
  )
  return operacion
}

// L16: el rename hace visible el archivo completo de una vez; nunca deja JSON a medias.
async function escribirReservas(reservas: Reserva[]): Promise<void> {
  const archivo = archivoReservas()
  await mkdir(dirname(archivo), { recursive: true })
  const temporal = `${archivo}.${randomUUID()}.tmp`
  await writeFile(temporal, JSON.stringify(reservas, null, 2), 'utf8')
  await rename(temporal, archivo)
}

export function guardarReserva(reserva: Reserva): Promise<void> {
  return enCola(async () => {
    const reservas = await leerReservas()
    const indice = reservas.findIndex((guardada) => guardada.id === reserva.id)
    if (indice === -1) reservas.push(reserva)
    else reservas[indice] = reserva
    await escribirReservas(reservas)
  })
}

export function actualizarReserva(
  id: string,
  cambios: Partial<Omit<Reserva, 'id'>>,
): Promise<Reserva | null> {
  return enCola(async () => {
    const reservas = await leerReservas()
    const indice = reservas.findIndex((reserva) => reserva.id === id)
    if (indice === -1) return null
    const actualizada = { ...reservas[indice], ...cambios, id }
    reservas[indice] = actualizada
    await escribirReservas(reservas)
    return actualizada
  })
}

export function reservarSiHayCamas(reserva: Reserva): Promise<boolean> {
  return enCola(async () => {
    const reservas = await leerReservas()
    const ocupadas = reservas
      .filter((guardada) => guardada.noche === reserva.noche && guardada.estado !== 'anulada')
      .reduce((total, guardada) => total + guardada.personas, 0)
    if (24 - ocupadas < reserva.personas) return false
    reservas.push(reserva)
    await escribirReservas(reservas)
    return true
  })
}

export async function buscarReserva(id: string | undefined): Promise<Reserva | null> {
  return (await leerReservas()).find((reserva) => reserva.id === id) ?? null
}

export async function reservasDeNoche(noche: string): Promise<Reserva[]> {
  return (await leerReservas()).filter((reserva) => reserva.noche === noche)
}

export async function camasLibres(noche: string): Promise<number> {
  const ocupadas = (await reservasDeNoche(noche))
    .filter((reserva) => reserva.estado !== 'anulada')
    .reduce((total, reserva) => total + reserva.personas, 0)
  return Math.max(0, 24 - ocupadas)
}
