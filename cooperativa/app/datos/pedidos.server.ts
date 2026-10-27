import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { Dia, LineaPedido, Pedido, Punto } from '~/tipos'
import { SEMANA } from './catalogo.server'

// Los pedidos se guardan en un archivo JSON. Una cooperativa de verdad usaría
// una base de datos; para el proyecto basta un archivo, que además se puede
// abrir y leer. La ruta se cambia con la variable de entorno ARCHIVO_PEDIDOS.
function archivo(): string {
  return process.env.ARCHIVO_PEDIDOS ?? 'datos/pedidos.json'
}

const linea = (productoId: string, nombre: string, formato: string, precio: number, cantidad: number): LineaPedido => ({
  productoId,
  nombre,
  formato,
  precio,
  cantidad,
})

const conTotal = (pedido: Omit<Pedido, 'total'>): Pedido => ({
  ...pedido,
  total: pedido.lineas.reduce((suma, l) => suma + l.precio * l.cantidad, 0),
})

/** Los pedidos que ya había: los de otros socios esta semana y uno de Pilar de la anterior. */
export const PEDIDOS_INICIALES: Pedido[] = [
  conTotal({
    id: 'P-43-0012',
    semana: 43,
    socioId: 'S-0142',
    punto: 'casco',
    dia: 'jueves',
    telefono: '654210987',
    comentario: '',
    lineas: [linea('acelga', 'Acelga', 'manojo', 160, 2), linea('manzana', 'Manzana reineta', 'kilo', 220, 2), linea('huevos', 'Huevos camperos', 'docena', 360, 1)],
    creado: '2026-10-20T19:05:00+02:00',
  }),
  conTotal({
    id: 'P-44-0001',
    semana: 44,
    socioId: 'S-0088',
    punto: 'actur',
    dia: 'jueves',
    telefono: '676112233',
    comentario: '',
    lineas: [linea('borraja', 'Borraja', 'manojo de 1 kg', 240, 1), linea('tomate', 'Tomate rosa', 'kilo', 390, 2), linea('huevos', 'Huevos camperos', 'docena', 360, 1)],
    creado: '2026-10-26T09:12:00+01:00',
  }),
  conTotal({
    id: 'P-44-0002',
    semana: 44,
    socioId: 'S-0115',
    punto: 'casco',
    dia: 'viernes',
    telefono: '619445566',
    comentario: 'Llegaré hacia las 12:30.',
    lineas: [linea('cebolla', 'Cebolla de Fuentes', 'malla de 2 kg', 320, 1), linea('calabaza', 'Calabaza', 'pieza de unos 2 kg', 300, 1), linea('aceite', 'Aceite de oliva virgen extra', 'botella de 1 l', 950, 1)],
    creado: '2026-10-26T10:40:00+01:00',
  }),
  conTotal({
    id: 'P-44-0003',
    semana: 44,
    socioId: 'S-0131',
    punto: 'torrero',
    dia: 'jueves',
    telefono: '688778899',
    comentario: '+1 docena de huevos si sobran',
    lineas: [linea('melocoton', 'Melocotón de Calanda', 'kilo', 450, 2), linea('pan', 'Pan de cinta', 'pieza de 500 g', 210, 1)],
    creado: '2026-10-26T11:02:00+01:00',
  }),
  conTotal({
    id: 'P-44-0004',
    semana: 44,
    socioId: 'S-0007',
    punto: 'casco',
    dia: 'jueves',
    telefono: '600123456',
    comentario: 'Abro yo el local.',
    lineas: [linea('acelga', 'Acelga', 'manojo', 160, 1), linea('manzana', 'Manzana reineta', 'kilo', 220, 3)],
    creado: '2026-10-26T12:30:00+01:00',
  }),
]

/** Un pedido tal como se guarda: con el token del formulario que lo creó. */
type PedidoGuardado = Pedido & { token: string }

/**
 * Lo que hay en el archivo: los pedidos y, por socio, el token de la compra
 * que tiene a medias (paso 4). En una base de datos serían dos tablas.
 */
type Almacen = { pedidos: PedidoGuardado[]; pendientes: Record<string, string> }

async function leerAlmacen(): Promise<Almacen> {
  try {
    return JSON.parse(await readFile(archivo(), 'utf8')) as Almacen
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { pedidos: [], pendientes: {} }
    throw error
  }
}

// Escribir en el sitio deja un momento en que el archivo está vacío o a medias,
// y una lectura que llegue entonces falla en JSON.parse. Se escribe en un
// archivo temporal de la misma carpeta y después se renombra: rename cambia un
// archivo por otro de golpe, y quien lee ve el viejo o el nuevo, entero.
async function escribirAlmacen(almacen: Almacen): Promise<void> {
  await mkdir(dirname(archivo()), { recursive: true })
  const temporal = `${archivo()}.${randomUUID()}.tmp`
  try {
    await writeFile(temporal, JSON.stringify(almacen, null, 2))
    await rename(temporal, archivo())
  } catch (error) {
    // Si falla la escritura o el cambio de nombre, que el temporal no se quede
    // abandonado en la carpeta. force: no protesta si no llegó a crearse. Y si
    // borrarlo también falla, se ignora: el error que importa es el primero.
    await rm(temporal, { force: true }).catch(() => {})
    throw error
  }
}

/** Quita el token: no sale de esta capa ni viaja al navegador. */
const sinToken = ({ token: _token, ...pedido }: PedidoGuardado): Pedido => pedido

async function todos(): Promise<Pedido[]> {
  return [...PEDIDOS_INICIALES, ...(await leerAlmacen()).pedidos.map(sinToken)]
}

/** Los pedidos de una semana, en el orden en que llegaron. */
export async function pedidosDeLaSemana(semana: number): Promise<Pedido[]> {
  return (await todos()).filter((p) => p.semana === semana)
}

/** Los pedidos de un socio, el más reciente primero. */
export async function pedidosDeSocio(socioId: string): Promise<Pedido[]> {
  return (await todos()).filter((p) => p.socioId === socioId).sort((a, b) => b.creado.localeCompare(a.creado))
}

export async function buscarPedido(id: string): Promise<Pedido | null> {
  return (await todos()).find((p) => p.id === id) ?? null
}

export type PedidoNuevo = {
  socioId: string
  punto: Punto
  dia: Dia
  telefono: string
  comentario: string
  lineas: LineaPedido[]
  /** El token del formulario que lo envía (paso 4). */
  token: string
}

// Leer el archivo, cambiarlo y escribirlo son tres pasos con await en medio:
// si llegan dos peticiones a la vez, la segunda podría leer antes de que la
// primera escriba y borrar su cambio. La cola hace que cada operación espere a
// la anterior: dentro de ella, leer y escribir es atómico.
let cola: Promise<unknown> = Promise.resolve()

function enCola<T>(tarea: () => Promise<T>): Promise<T> {
  const resultado = cola.then(tarea)
  cola = resultado.catch(() => {})
  return resultado
}

/**
 * El token de la compra que el socio tiene a medias: el que ya hay o, si no
 * hay ninguno, uno nuevo. Vive en el servidor, no en la cookie: dos pestañas
 * que abren el pedido a la vez reciben el mismo, porque la segunda lo lee
 * después de que la primera lo haya guardado.
 */
export function tokenPendiente(socioId: string): Promise<string> {
  return enCola(async () => {
    const almacen = await leerAlmacen()
    const existente = almacen.pendientes[socioId]
    if (existente) return existente
    const token = randomUUID()
    await escribirAlmacen({ ...almacen, pendientes: { ...almacen.pendientes, [socioId]: token } })
    return token
  })
}

/** El pedido que ya creó ese token, o null. En la cola, como lo que escribe. */
export function pedidoConToken(socioId: string, token: string): Promise<Pedido | null> {
  return enCola(async () => {
    const guardado = (await leerAlmacen()).pedidos.find((p) => p.token === token && p.socioId === socioId)
    return guardado ? sinToken(guardado) : null
  })
}

/** Lo que devuelve guardarPedido: el pedido y si lo acaba de crear esta llamada. */
export type Guardado = { pedido: Pedido; nuevo: boolean }

/**
 * Guarda un pedido de la semana actual, si su token vale:
 * - si ya hay un pedido con ese token (el mismo formulario enviado dos veces,
 *   a la vez o después), devuelve ese, con nuevo: false, sin guardar otro;
 * - si es el token pendiente del socio, guarda el pedido, gasta el token y lo
 *   devuelve con nuevo: true;
 * - si no es ninguno de los dos, devuelve null.
 */
export function guardarPedido({ token, ...nuevo }: PedidoNuevo): Promise<Guardado | null> {
  return enCola(async () => {
    const almacen = await leerAlmacen()
    const repetido = almacen.pedidos.find((p) => p.token === token && p.socioId === nuevo.socioId)
    if (repetido) return { pedido: sinToken(repetido), nuevo: false }
    if (almacen.pendientes[nuevo.socioId] !== token) return null

    const deLaSemana = [...PEDIDOS_INICIALES, ...almacen.pedidos].filter((p) => p.semana === SEMANA.numero)
    const pedido = conTotal({
      ...nuevo,
      id: `P-${SEMANA.numero}-${String(deLaSemana.length + 1).padStart(4, '0')}`,
      semana: SEMANA.numero,
      creado: new Date().toISOString(),
    })
    const { [nuevo.socioId]: _gastado, ...pendientes } = almacen.pendientes
    await escribirAlmacen({ pedidos: [...almacen.pedidos, { ...pedido, token }], pendientes })
    return { pedido, nuevo: true }
  })
}
