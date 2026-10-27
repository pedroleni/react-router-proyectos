// Lo que comparten los tests. No saben qué router usa la app ni cómo pide sus
// datos: la montan con iniciarApp, igual que main.tsx, miran la URL y lo que
// se ve, y hablan con la misma API que sirve `npm run dev`, en memoria.
// Ningún paso de la migración toca esta carpeta.

import { act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { crearApi, type Api } from '../servidor/api.ts'
import { iniciarApp } from '../src/app'

let api: Api
let sesion: string | null = null
let desmontar: (() => void) | null = null

// Antes de cada test: la API con sus datos de partida, «hoy» fijo y sin sesión.
export function prepararRed() {
  api = crearApi({ hoy: () => '2026-10-26' })
  sesion = null
  vi.stubGlobal('fetch', async (entrada: string | URL, init: RequestInit = {}) => {
    const url = new URL(String(entrada), window.location.href)
    init.signal?.throwIfAborted()
    const respuesta = api.manejar({
      metodo: (init.method ?? 'GET').toUpperCase(),
      ruta: url.pathname + url.search,
      cuerpo: typeof init.body === 'string' ? JSON.parse(init.body) : undefined,
      sesion,
    })
    // La cookie de sesión, como haría el navegador.
    if (respuesta.sesion !== undefined) sesion = respuesta.sesion
    // Como en la red, la respuesta llega después, no en el mismo instante.
    await new Promise((resolver) => setTimeout(resolver, 0))
    init.signal?.throwIfAborted()
    return new Response(respuesta.cuerpo === undefined ? null : JSON.stringify(respuesta.cuerpo), {
      status: respuesta.estado,
      headers: { 'Content-Type': 'application/json' },
    })
  })
}

// Después de cada test.
export function cerrar() {
  if (desmontar) act(() => desmontar!())
  desmontar = null
  // Los tests del servidor (pruebas/servidor) corren en Node, sin documento.
  if (typeof document !== 'undefined') document.body.innerHTML = ''
  vi.unstubAllGlobals()
}

// Abre la app en una dirección, como si la escribieras en la barra.
export async function abrir(direccion: string) {
  window.history.replaceState(null, '', direccion)
  const contenedor = document.createElement('div')
  document.body.append(contenedor)
  await act(async () => {
    desmontar = iniciarApp(contenedor)
  })
  return userEvent.setup()
}

// Una sesión ya abierta, sin pasar por el formulario.
export function entrarComo(usuario = 'marta') {
  sesion = api.abrirSesion(usuario)
}

// Que una ruta de la API responda con un 500: fallar('GET /api/libros'),
// siempre, o solo las próximas veces: fallar('GET /api/sesion', 1).
export function fallar(clave: string, veces?: number) {
  api.fallar(clave, veces)
}

export function ruta() {
  return window.location.pathname + window.location.search
}
