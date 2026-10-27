// Los tipos que comparten el servidor y el navegador.

export type Rol = 'socio' | 'reparto'

/** Un socio de la cooperativa, sin su contraseña: esto sí puede salir del servidor. */
export type Socio = {
  id: string
  numero: number
  nombre: string
  correo: string
  /** «reparto» puede descargar la hoja de reparto de la semana. */
  rol: Rol
}

export type Producto = {
  id: string
  nombre: string
  /** «manojo de 1 kg», «docena»... lo que recibes por cada unidad. */
  formato: string
  origen: string
  /** En céntimos: 240 son 2,40 €. */
  precio: number
  /** Cuántas unidades caben como mucho en una cesta. */
  maximo: number
}

/** Lo que lleva la cesta: unidades por id de producto. Solo los que tienen alguna. */
export type Cesta = Record<string, number>

export type Punto = 'casco' | 'actur' | 'torrero'
export type Dia = 'jueves' | 'viernes'

export type LineaPedido = {
  productoId: string
  nombre: string
  formato: string
  precio: number
  cantidad: number
}

export type Pedido = {
  /** «P-44-0007»: la semana y un número. */
  id: string
  semana: number
  socioId: string
  punto: Punto
  dia: Dia
  telefono: string
  comentario: string
  lineas: LineaPedido[]
  /** En céntimos. */
  total: number
  /** Fecha ISO. */
  creado: string
}
