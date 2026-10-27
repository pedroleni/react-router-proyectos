import type { Reserva } from '~/tipos'

function pendiente(): never {
  // TODO (lección 16): implementa la lectura y escritura atómica del JSON con
  // una cola en proceso. Busca fs/promises, archivo temporal y rename.
  throw new Error('TODO (lección 16): persistencia de reservas en el servidor.')
}

export async function leerReservas(): Promise<Reserva[]> {
  return pendiente()
}

export async function guardarReserva(_reserva: Reserva): Promise<void> {
  return pendiente()
}

export async function actualizarReserva(
  _id: string,
  _cambios: Partial<Omit<Reserva, 'id'>>,
): Promise<Reserva | null> {
  return pendiente()
}

export async function reservarSiHayCamas(_reserva: Reserva): Promise<boolean> {
  return pendiente()
}

export async function buscarReserva(_id: string | undefined): Promise<Reserva | null> {
  return pendiente()
}

export async function reservasDeNoche(_noche: string): Promise<Reserva[]> {
  return pendiente()
}

export async function camasLibres(_noche: string): Promise<number> {
  return pendiente()
}
