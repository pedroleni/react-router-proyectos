export type Usuario = { usuario: string; nombre: string }

export type Libro = {
  id: number
  titulo: string
  autor: string
  estanteria: string
  ejemplares: number
  disponibles: number
}

export type Ejemplar = { codigo: string; prestadoHasta: string | null }

export type Alumno = { id: number; nombre: string; curso: string }

export type Prestamo = {
  id: number
  libroId: number
  titulo: string
  ejemplar: string
  alumnoId: number
  alumno: string
  curso: string
  desde: string
  hasta: string
  vencido: boolean
}

export type ErroresPrestamo = Partial<Record<'alumnoId' | 'libroId' | 'dias', string>>
