export type Etapa = {
  slug: string
  origen: string
  destino: string
  kilometros: number
  descripcion: string
}

export type EstadoReserva = 'reservada' | 'llegada' | 'anulada'

export type Reserva = {
  id: string
  noche: string
  nombre: string
  documento: string
  personas: number
  estado: EstadoReserva
  credencial: string | null
}

export type Hospitalero = {
  id: string
  usuario: string
  nombre: string
}

export type Aviso = {
  tipo: 'corte-agua' | 'fiesta'
  texto: string
  hasta: string
}
