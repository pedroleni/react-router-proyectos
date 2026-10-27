// Un plugin de Vite que sirve la API de la biblioteca en /api, en
// `npm run dev` y en `npm run preview`. Cada respuesta tarda LATENCIA_API
// milisegundos (300 por defecto), como una red de verdad: así se ven las
// peticiones en cascada.
//
// La cookie de sesión es HttpOnly y SameSite=Lax. Si la petición llega por
// HTTPS (o con COOKIE_SEGURA=1), lleva además Secure y se llama
// __Host-sesion: el navegador solo acepta ese prefijo con Secure, Path=/ y sin
// Domain, así que nadie puede colarla desde un subdominio ni por HTTP.
// COOKIE_SEGURA=0 la desactiva (para probar sin HTTPS detrás de un proxy).

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { TLSSocket } from 'node:tls'
import type { Plugin } from 'vite'
import { crearApi, type Api } from './api.ts'

type Siguiente = (error?: unknown) => void

function leerCuerpo(peticion: IncomingMessage): Promise<unknown> {
  return new Promise((resolver, rechazar) => {
    let texto = ''
    peticion.setEncoding('utf8')
    peticion.on('data', (trozo: string) => (texto += trozo))
    peticion.on('end', () => {
      try {
        resolver(texto ? JSON.parse(texto) : undefined)
      } catch (error) {
        rechazar(error)
      }
    })
    peticion.on('error', rechazar)
  })
}

function esSegura(peticion: IncomingMessage) {
  if (process.env.COOKIE_SEGURA === '1') return true
  if (process.env.COOKIE_SEGURA === '0') return false
  return Boolean((peticion.socket as TLSSocket).encrypted) || peticion.headers['x-forwarded-proto'] === 'https'
}

function nombreCookie(segura: boolean) {
  return segura ? '__Host-sesion' : 'sesion'
}

function leerSesion(cabecera: string | undefined, nombre: string) {
  const cookie = (cabecera ?? '').split(';').map((c) => c.trim()).find((c) => c.startsWith(`${nombre}=`))
  return cookie ? decodeURIComponent(cookie.slice(nombre.length + 1)) : null
}

// La cabecera Set-Cookie de la sesión. Un valor null la borra (Max-Age=0),
// con el mismo nombre y los mismos atributos con que se puso.
export function cookieDeSesion(valor: string | null, segura: boolean) {
  const atributos = ['Path=/', 'HttpOnly', 'SameSite=Lax']
  if (segura) atributos.push('Secure')
  if (valor === null) atributos.push('Max-Age=0')
  return [`${nombreCookie(segura)}=${valor === null ? '' : encodeURIComponent(valor)}`, ...atributos].join('; ')
}

// El middleware de /api, aparte del plugin para poder probarlo con un
// servidor HTTP de Node (pruebas/servidor/cookie.test.ts).
export function crearMiddlewareApi(api: Api, latencia: number) {
  return async function middleware(peticion: IncomingMessage, respuesta: ServerResponse, siguiente: Siguiente) {
    if (!peticion.url?.startsWith('/api/')) return siguiente()
    try {
      const segura = esSegura(peticion)
      const cuerpo = await leerCuerpo(peticion)
      await new Promise((resolver) => setTimeout(resolver, latencia))
      const resultado = api.manejar({
        metodo: peticion.method ?? 'GET',
        ruta: peticion.url,
        cuerpo,
        sesion: leerSesion(peticion.headers.cookie, nombreCookie(segura)),
      })
      if (resultado.sesion !== undefined) {
        respuesta.setHeader('Set-Cookie', cookieDeSesion(resultado.sesion, segura))
      }
      respuesta.statusCode = resultado.estado
      if (resultado.cuerpo === undefined) return respuesta.end()
      respuesta.setHeader('Content-Type', 'application/json; charset=utf-8')
      respuesta.end(JSON.stringify(resultado.cuerpo))
    } catch (error) {
      siguiente(error)
    }
  }
}

export function apiBiblioteca(): Plugin {
  const middleware = crearMiddlewareApi(crearApi(), Number(process.env.LATENCIA_API ?? 300))
  return {
    name: 'api-biblioteca',
    configureServer(servidor) {
      servidor.middlewares.use(middleware)
    },
    configurePreviewServer(servidor) {
      servidor.middlewares.use(middleware)
    },
  }
}
