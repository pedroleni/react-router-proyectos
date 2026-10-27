import { randomUUID } from 'node:crypto'
import { readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { productosDeLaSemana } from '~/datos/catalogo.server'
import { buscarPedido, guardarPedido, pedidosDeSocio, tokenPendiente } from '~/datos/pedidos.server'
import { buscarSocio, comprobarCredenciales } from '~/datos/socios.server'

// La capa de datos ya viene hecha: estos tests pasan desde el principio.

// Para simular que rename falla: node:fs/promises es el de verdad, rename
// también, salvo cuando un test pone un error en fallo.rename.
const fallo = vi.hoisted(() => ({ rename: null as Error | null }))
vi.mock('node:fs/promises', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs/promises')>()
  return {
    ...fs,
    rename: (...args: Parameters<typeof fs.rename>) => (fallo.rename ? Promise.reject(fallo.rename) : fs.rename(...args)),
  }
})

describe('La capa de datos', () => {
  it('el catálogo de la semana tiene diez productos, con el precio en céntimos', () => {
    const productos = productosDeLaSemana()
    expect(productos).toHaveLength(10)
    expect(productos.find((p) => p.id === 'borraja')).toMatchObject({ precio: 240, maximo: 4 })
  })

  it('con el correo y la contraseña buenos, comprobarCredenciales da el socio, sin su huella', async () => {
    const socio = await comprobarCredenciales(' Pilar@huertadelebro.example ', 'borraja2026')
    expect(socio).toEqual({ id: 'S-0142', numero: 142, nombre: 'Pilar Lasierra', correo: 'pilar@huertadelebro.example', rol: 'socio' })
    expect(buscarSocio('S-0007')?.rol).toBe('reparto')
  })

  it('con una contraseña mala o un correo que no existe, da null', async () => {
    expect(await comprobarCredenciales('pilar@huertadelebro.example', 'Borraja2026')).toBeNull()
    expect(await comprobarCredenciales('nadie@huertadelebro.example', 'borraja2026')).toBeNull()
  })

  const NUEVO = {
    socioId: 'S-0142',
    punto: 'actur' as const,
    dia: 'viernes' as const,
    telefono: '654210987',
    comentario: '',
    lineas: [{ productoId: 'borraja', nombre: 'Borraja', formato: 'manojo de 1 kg', precio: 240, cantidad: 5 }],
  }

  it('tokenPendiente da el mismo token a dos peticiones a la vez, y guardarPedido lo gasta', async () => {
    const [uno, otro] = await Promise.all([tokenPendiente('S-0142'), tokenPendiente('S-0142')])
    expect(otro).toBe(uno)
    const guardado = await guardarPedido({ ...NUEVO, token: uno })
    expect(guardado?.nuevo).toBe(true)
    const pedido = guardado?.pedido
    expect(pedido).toMatchObject({ id: 'P-44-0005', semana: 44, total: 1200 })
    expect(await buscarPedido('P-44-0005')).toEqual(pedido)
    expect((await pedidosDeSocio('S-0142')).map((p) => p.id)).toEqual(['P-44-0005', 'P-43-0012'])
    // Gastado: la próxima compra tiene otro.
    expect(await tokenPendiente('S-0142')).not.toBe(uno)
  })

  it('el mismo token dos veces a la vez da el mismo pedido (nuevo solo el primero), y uno que no es el pendiente, null', async () => {
    const token = await tokenPendiente('S-0142')
    const [primero, segundo] = await Promise.all([guardarPedido({ ...NUEVO, token }), guardarPedido({ ...NUEVO, token })])
    expect(primero?.nuevo).toBe(true)
    expect(segundo?.nuevo).toBe(false)
    expect(segundo?.pedido).toEqual(primero?.pedido)
    expect(primero?.pedido).not.toHaveProperty('token')
    expect(await guardarPedido({ ...NUEVO, token: 'me-lo-invento' })).toBeNull()
    expect(await pedidosDeSocio('S-0142')).toHaveLength(2)
  })

  it('una lectura mientras se escribe el archivo nunca encuentra el JSON a medias', async () => {
    // Un bucle que crea 25 pedidos seguidos, y otro que lee los pedidos sin
    // parar mientras tanto. Si el archivo se escribiera en el sitio, alguna
    // lectura lo pillaría vacío o cortado y JSON.parse lanzaría un error.
    let escribiendo = true
    const escribir = (async () => {
      for (let i = 0; i < 25; i++) await guardarPedido({ ...NUEVO, token: await tokenPendiente('S-0142') })
      escribiendo = false
    })()
    let lecturas = 0
    const leer = (async () => {
      while (escribiendo) {
        await pedidosDeSocio('S-0142')
        lecturas++
      }
    })()
    await Promise.all([escribir, leer])
    expect(lecturas).toBeGreaterThan(0)
    expect(await pedidosDeSocio('S-0142')).toHaveLength(26)
  })

  it('si el cambio de nombre falla, no queda ningún .tmp y el error que sale es el de rename', async () => {
    const carpeta = join(tmpdir(), `cooperativa-fallo-${randomUUID()}`)
    process.env.ARCHIVO_PEDIDOS = join(carpeta, 'pedidos.json')
    const error = Object.assign(new Error('rename simulado'), { code: 'EXDEV' })
    fallo.rename = error
    try {
      await expect(tokenPendiente('S-0142')).rejects.toBe(error)
    } finally {
      fallo.rename = null
    }
    // writeFile llegó a crear el temporal; escribirAlmacen lo ha borrado.
    expect(await readdir(carpeta)).toEqual([])
    await rm(carpeta, { recursive: true })
  })
})
