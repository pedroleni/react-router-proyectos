// Los datos de partida de la biblioteca. Las fechas de los préstamos son
// relativas a «hoy» (en días), para que la app tenga préstamos vencidos y en
// plazo el día que la arranques. Los tests fijan «hoy» en el 26 de octubre de 2026.

export type LibroGuardado = {
  id: number
  titulo: string
  autor: string
  estanteria: string
  ejemplares: number
  prefijo: string
}

export type AlumnoGuardado = { id: number; nombre: string; curso: string }

export type PrestamoInicial = {
  libroId: number
  alumnoId: number
  desdeHace: number
  venceEn: number
}

export const LIBROS: LibroGuardado[] = [
  { id: 1, titulo: 'El Lazarillo de Tormes', autor: 'Anónimo', estanteria: 'Clásicos', ejemplares: 6, prefijo: 'LAZ' },
  { id: 2, titulo: 'La casa de Bernarda Alba', autor: 'Federico García Lorca', estanteria: 'Teatro', ejemplares: 5, prefijo: 'BER' },
  { id: 3, titulo: 'Marianela', autor: 'Benito Pérez Galdós', estanteria: 'Clásicos', ejemplares: 4, prefijo: 'MAR' },
  { id: 4, titulo: 'Nada', autor: 'Carmen Laforet', estanteria: 'Novela del siglo XX', ejemplares: 3, prefijo: 'NAD' },
  { id: 5, titulo: 'El camino', autor: 'Miguel Delibes', estanteria: 'Novela del siglo XX', ejemplares: 4, prefijo: 'CAM' },
  { id: 6, titulo: 'Los santos inocentes', autor: 'Miguel Delibes', estanteria: 'Novela del siglo XX', ejemplares: 2, prefijo: 'SAN' },
  { id: 7, titulo: 'Luces de bohemia', autor: 'Ramón María del Valle-Inclán', estanteria: 'Teatro', ejemplares: 3, prefijo: 'LUC' },
  { id: 8, titulo: 'Campos de Castilla', autor: 'Antonio Machado', estanteria: 'Poesía', ejemplares: 3, prefijo: 'CCA' },
  { id: 9, titulo: 'Rimas y leyendas', autor: 'Gustavo Adolfo Bécquer', estanteria: 'Poesía', ejemplares: 4, prefijo: 'RIM' },
  { id: 10, titulo: 'Momo', autor: 'Michael Ende', estanteria: 'Lectura libre', ejemplares: 3, prefijo: 'MOM' },
  { id: 11, titulo: 'Manolito Gafotas', autor: 'Elvira Lindo', estanteria: 'Lectura libre', ejemplares: 3, prefijo: 'MAN' },
  { id: 12, titulo: 'Platero y yo', autor: 'Juan Ramón Jiménez', estanteria: 'Clásicos', ejemplares: 2, prefijo: 'PLA' },
]

export const ALUMNOS: AlumnoGuardado[] = [
  { id: 1, nombre: 'Lucía Pardo', curso: '3.º ESO A' },
  { id: 2, nombre: 'Hugo Martínez', curso: '3.º ESO A' },
  { id: 3, nombre: 'Nerea Soto', curso: '4.º ESO B' },
  { id: 4, nombre: 'Iván Ortega', curso: '1.º Bachillerato' },
  { id: 5, nombre: 'Alba Romero', curso: '2.º ESO C' },
  { id: 6, nombre: 'Daniel Sanz', curso: '4.º ESO B' },
  { id: 7, nombre: 'Carla Benito', curso: '1.º Bachillerato' },
  { id: 8, nombre: 'Óscar Lafuente', curso: '2.º ESO C' },
]

export const PRESTAMOS: PrestamoInicial[] = [
  { libroId: 3, alumnoId: 1, desdeHace: 21, venceEn: -7 },
  { libroId: 9, alumnoId: 1, desdeHace: 3, venceEn: 11 },
  { libroId: 12, alumnoId: 1, desdeHace: 14, venceEn: 0 },
  { libroId: 1, alumnoId: 2, desdeHace: 12, venceEn: 2 },
  { libroId: 4, alumnoId: 3, desdeHace: 6, venceEn: 8 },
  { libroId: 7, alumnoId: 4, desdeHace: 18, venceEn: -4 },
  { libroId: 10, alumnoId: 5, desdeHace: 5, venceEn: 9 },
  { libroId: 6, alumnoId: 6, desdeHace: 10, venceEn: 4 },
  { libroId: 6, alumnoId: 7, desdeHace: 7, venceEn: 7 },
]

// Quien puede entrar en la parte de préstamos. Es una app de prácticas: la
// contraseña está aquí, en claro, y en el README.
export const USUARIOS = [{ usuario: 'marta', clave: 'tierrasaltas', nombre: 'Marta Gil' }]
