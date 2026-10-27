// La API de la biblioteca, en memoria. No sabe nada de React ni del router:
// la sirve el plugin de Vite (servidor/plugin.ts) en `npm run dev` y en
// `npm run preview`, y los tests la usan a través de un fetch simulado.
// Ninguno de los pasos de la migración toca esta carpeta.

import { ALUMNOS, LIBROS, PRESTAMOS, USUARIOS } from './datos.ts'

export type Peticion = {
  metodo: string
  ruta: string
  cuerpo?: unknown
  sesion?: string | null
}

// `sesion`: undefined deja la cookie como está; null la borra; un texto la pone.
export type Respuesta = {
  estado: number
  cuerpo?: unknown
  sesion?: string | null
}

type PrestamoGuardado = {
  id: number
  libroId: number
  alumnoId: number
  ejemplar: string
  desde: string
  hasta: string
  devuelto: boolean
}

const MAXIMO_POR_ALUMNO = 3
const PLAZOS = [7, 14, 21]

export function hoyEnISO() {
  return new Date().toISOString().slice(0, 10)
}

function sumarDias(iso: string, dias: number) {
  const fecha = new Date(`${iso}T00:00:00Z`)
  fecha.setUTCDate(fecha.getUTCDate() + dias)
  return fecha.toISOString().slice(0, 10)
}

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export function crearApi({ hoy = hoyEnISO }: { hoy?: () => string } = {}) {
  const alumnos = ALUMNOS.map((alumno) => ({ ...alumno }))
  const sesiones = new Map<string, string>()
  const fallos = new Map<string, number>()
  const prestamos: PrestamoGuardado[] = []
  let siguienteId = 1

  function primerEjemplarLibre(libroId: number) {
    const libro = LIBROS.find((l) => l.id === libroId)!
    const ocupados = new Set(activos().filter((p) => p.libroId === libroId).map((p) => p.ejemplar))
    for (let n = 1; n <= libro.ejemplares; n++) {
      const codigo = `${libro.prefijo}-${String(n).padStart(2, '0')}`
      if (!ocupados.has(codigo)) return codigo
    }
    return null
  }

  function activos() {
    return prestamos.filter((p) => !p.devuelto)
  }

  function prestar(libroId: number, alumnoId: number, desde: string, hasta: string) {
    const prestamo = {
      id: siguienteId++,
      libroId,
      alumnoId,
      ejemplar: primerEjemplarLibre(libroId)!,
      desde,
      hasta,
      devuelto: false,
    }
    prestamos.push(prestamo)
    return prestamo
  }

  for (const inicial of PRESTAMOS) {
    prestar(inicial.libroId, inicial.alumnoId, sumarDias(hoy(), -inicial.desdeHace), sumarDias(hoy(), inicial.venceEn))
  }

  function disponibles(libroId: number) {
    const libro = LIBROS.find((l) => l.id === libroId)!
    return libro.ejemplares - activos().filter((p) => p.libroId === libroId).length
  }

  function libroPublico(libroId: number) {
    const { prefijo: _prefijo, ...libro } = LIBROS.find((l) => l.id === libroId)!
    return { ...libro, disponibles: disponibles(libroId) }
  }

  function prestamoPublico(prestamo: PrestamoGuardado) {
    const libro = LIBROS.find((l) => l.id === prestamo.libroId)!
    const alumno = alumnos.find((a) => a.id === prestamo.alumnoId)!
    return {
      id: prestamo.id,
      libroId: libro.id,
      titulo: libro.titulo,
      ejemplar: prestamo.ejemplar,
      alumnoId: alumno.id,
      alumno: alumno.nombre,
      curso: alumno.curso,
      desde: prestamo.desde,
      hasta: prestamo.hasta,
      vencido: prestamo.hasta < hoy(),
    }
  }

  function usuarioDe(sesion: string | null | undefined) {
    const nombre = sesion ? sesiones.get(sesion) : undefined
    const usuario = USUARIOS.find((u) => u.usuario === nombre)
    return usuario ? { usuario: usuario.usuario, nombre: usuario.nombre } : null
  }

  function manejar({ metodo, ruta, cuerpo, sesion }: Peticion): Respuesta {
    const url = new URL(ruta, 'http://biblioteca.local')
    const partes = url.pathname.split('/').filter(Boolean)
    const clave = `${metodo} ${url.pathname}`
    const pendientes = fallos.get(clave) ?? 0
    if (pendientes > 0) {
      fallos.set(clave, pendientes - 1)
      return { estado: 500, cuerpo: { error: 'Error del servidor (simulado)' } }
    }
    if (partes[0] !== 'api') return { estado: 404, cuerpo: { error: 'No existe' } }
    const usuario = usuarioDe(sesion)
    const datos = (cuerpo ?? {}) as Record<string, unknown>
    const sinSesion = { estado: 401, cuerpo: { error: 'Necesitas iniciar sesión.' } }

    // /api/sesion
    if (partes[1] === 'sesion' && partes.length === 2) {
      if (metodo === 'GET') return { estado: 200, cuerpo: { usuario } }
      if (metodo === 'POST') {
        const encontrado = USUARIOS.find((u) => u.usuario === datos.usuario && u.clave === datos.clave)
        if (!encontrado) return { estado: 401, cuerpo: { error: 'Usuario o contraseña incorrectos.' } }
        const nueva = crypto.randomUUID()
        sesiones.set(nueva, encontrado.usuario)
        return { estado: 200, cuerpo: { usuario: usuarioDe(nueva) }, sesion: nueva }
      }
      if (metodo === 'DELETE') {
        if (sesion) sesiones.delete(sesion)
        return { estado: 204, sesion: null }
      }
    }

    // /api/libros, /api/libros/:id y /api/libros/:id/ejemplares (públicos)
    if (partes[1] === 'libros' && metodo === 'GET') {
      if (partes.length === 2) {
        const q = normalizar(url.searchParams.get('q') ?? '')
        const soloDisponibles = url.searchParams.get('disponibles') === '1'
        const encontrados = LIBROS.filter((l) => normalizar(`${l.titulo} ${l.autor}`).includes(q))
          .map((l) => libroPublico(l.id))
          .filter((l) => !soloDisponibles || l.disponibles > 0)
          .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
        return { estado: 200, cuerpo: encontrados }
      }
      const libro = LIBROS.find((l) => String(l.id) === partes[2])
      if (!libro) return { estado: 404, cuerpo: { error: 'Ese libro no existe.' } }
      if (partes.length === 3) return { estado: 200, cuerpo: libroPublico(libro.id) }
      if (partes[3] === 'ejemplares' && partes.length === 4) {
        const ejemplares = []
        for (let n = 1; n <= libro.ejemplares; n++) {
          const codigo = `${libro.prefijo}-${String(n).padStart(2, '0')}`
          const prestamo = activos().find((p) => p.ejemplar === codigo)
          ejemplares.push({ codigo, prestadoHasta: prestamo ? prestamo.hasta : null })
        }
        return { estado: 200, cuerpo: ejemplares }
      }
    }

    // /api/alumnos (con sesión)
    if (partes[1] === 'alumnos' && partes.length === 2 && metodo === 'GET') {
      if (!usuario) return sinSesion
      return { estado: 200, cuerpo: [...alumnos].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')) }
    }

    // /api/prestamos y /api/prestamos/:id/devolucion (con sesión)
    if (partes[1] === 'prestamos') {
      if (!usuario) return sinSesion
      if (partes.length === 2 && metodo === 'GET') {
        const lista = activos()
          .map(prestamoPublico)
          .sort((a, b) => a.hasta.localeCompare(b.hasta) || a.id - b.id)
        return { estado: 200, cuerpo: lista }
      }
      if (partes.length === 2 && metodo === 'POST') {
        const alumnoId = Number(datos.alumnoId)
        const libroId = Number(datos.libroId)
        const dias = Number(datos.dias)
        const alumno = alumnos.find((a) => a.id === alumnoId)
        const libro = LIBROS.find((l) => l.id === libroId)
        const errores: Record<string, string> = {}
        if (!alumno) errores.alumnoId = 'Elige quién se lo lleva.'
        else if (activos().filter((p) => p.alumnoId === alumnoId).length >= MAXIMO_POR_ALUMNO) {
          errores.alumnoId = `${alumno.nombre} ya tiene ${MAXIMO_POR_ALUMNO} libros en préstamo.`
        }
        if (!libro) errores.libroId = 'Elige un libro.'
        else if (disponibles(libroId) === 0) errores.libroId = `No quedan ejemplares de «${libro.titulo}».`
        if (!PLAZOS.includes(dias)) errores.dias = 'Elige un plazo de 7, 14 o 21 días.'
        if (Object.keys(errores).length > 0) return { estado: 400, cuerpo: { errores } }
        const prestamo = prestar(libroId, alumnoId, hoy(), sumarDias(hoy(), dias))
        return { estado: 201, cuerpo: prestamoPublico(prestamo) }
      }
      if (partes.length === 4 && partes[3] === 'devolucion' && metodo === 'POST') {
        const prestamo = activos().find((p) => String(p.id) === partes[2])
        if (!prestamo) return { estado: 404, cuerpo: { error: 'Ese préstamo no existe o ya está devuelto.' } }
        prestamo.devuelto = true
        return { estado: 200, cuerpo: prestamoPublico(prestamo) }
      }
    }

    return { estado: 404, cuerpo: { error: 'No existe' } }
  }

  return {
    manejar,
    // Para los tests: que una ruta responda 500 («GET /api/libros»), siempre
    // o solo las próximas «veces».
    fallar(clave: string, veces = Infinity) {
      fallos.set(clave, veces)
    },
    // Para los tests: una sesión abierta sin pasar por el formulario.
    abrirSesion(usuario = 'marta') {
      const nueva = crypto.randomUUID()
      sesiones.set(nueva, usuario)
      return nueva
    },
  }
}

export type Api = ReturnType<typeof crearApi>
