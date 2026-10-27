// @vitest-environment node
import { readdir } from 'node:fs/promises'
import { Children, isValidElement, type ReactElement, type ReactNode } from 'react'
import { Link } from 'react-router'
import { describe, expect, it } from 'vitest'
import { aCsv } from '~/csv'
import { loader as etapasJson } from '~/routes/recursos/etapas-json'
import { loader as sitemap } from '~/routes/recursos/sitemap'
import { action as guardarAviso, loader as metodoAvisos } from '~/routes/recursos/avisos'
import { loader as portada } from '~/routes/portada'
import { action as reserva } from '~/routes/hospitaleros/reserva'
import { loader as pernoctas } from '~/routes/hospitaleros/pernoctas-csv'
import Zona from '~/routes/hospitaleros/zona'
import { buscarReserva, guardarReserva } from '~/datos/reservas.server'
import { argumentos, respuesta } from './peticion'

function estado(valor: unknown): number | undefined {
  if (valor instanceof Response) return valor.status
  return (valor as { init?: ResponseInit }).init?.status
}

function buscarEnlaceCsv(nodo: ReactNode): ReactElement | undefined {
  if (!isValidElement(nodo)) return undefined
  const props = nodo.props as { children?: ReactNode; to?: string; reloadDocument?: boolean }
  if (nodo.type === Link && props.to === '/hospitaleros/pernoctas.csv') return nodo
  for (const hijo of Children.toArray(props.children)) {
    const encontrado = buscarEnlaceCsv(hijo)
    if (encontrado) return encontrado
  }
  return undefined
}

describe('lección 19: rutas de recursos', () => {
  it('el enlace al CSV fuerza una descarga de documento', () => {
    const arbol = Zona({
      loaderData: { hospitalero: { id: 'h-marta', usuario: 'marta', nombre: 'Marta' } },
    } as never)
    const enlace = buscarEnlaceCsv(arbol)
    expect(enlace).toBeDefined()
    expect((enlace?.props as { reloadDocument?: boolean }).reloadDocument).toBe(true)
  })

  it('crea CSV para Excel, escapa comillas y neutraliza fórmulas', () => {
    const csv = aCsv([
      ['Nombre', 'Nota'],
      ['Ana', 'dijo "hola"'],
      ['Mal', '=HIPERVINCULO("x")'],
      ['Más', '+1'],
      ['Menos', '-1'],
      ['Arroba', '@dato'],
      ['Tabulador', '\tdato'],
      ['Retorno', '\rdato'],
    ])
    expect(csv.startsWith('\uFEFFNombre;Nota\r\n')).toBe(true)
    expect(csv).toContain('"dijo ""hola"""')
    expect(csv).toContain("'=HIPERVINCULO")
    for (const valor of ['+1', '-1', '@dato', '\tdato', '\rdato']) expect(csv).toContain(`'${valor}`)
  })

  it('el CSV rechaza saltos y comillas en noche sin romper sus cabeceras', async () => {
    for (const noche of ['a\r\nb', 'x".html', '2026-02-30']) {
      const resultado = await pernoctas(
        argumentos<Parameters<typeof pernoctas>[0]>(
          `/hospitaleros/pernoctas.csv?noche=${encodeURIComponent(noche)}`
        )
      ).catch((error) => error)
      expect(estado(resultado)).toBe(400)
    }
  })

  it('el CSV excluye anuladas y declara descarga CSV con nosniff', async () => {
    await guardarReserva({
      id: 'csv-activa',
      noche: '2031-07-03',
      nombre: 'Activa',
      documento: '***111',
      personas: 1,
      estado: 'reservada',
      credencial: null,
    })
    await guardarReserva({
      id: 'csv-anulada',
      noche: '2031-07-03',
      nombre: 'Anulada',
      documento: '***222',
      personas: 1,
      estado: 'anulada',
      credencial: null,
    })
    const resultado = respuesta(
      await pernoctas(
        argumentos<Parameters<typeof pernoctas>[0]>('/hospitaleros/pernoctas.csv?noche=2031-07-03')
      )
    )
    expect(resultado.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(resultado.headers.get('Content-Disposition')).toBe(
      'attachment; filename="pernoctas-2031-07-03.csv"'
    )
    expect(resultado.headers.get('X-Content-Type-Options')).toBe('nosniff')
    const csv = await resultado.text()
    expect(csv).toContain('Activa')
    expect(csv).not.toContain('Anulada')
  })

  it('publica las etapas como JSON con CORS y caché', async () => {
    const respuesta = etapasJson()
    expect(respuesta.headers.get('Content-Type')).toContain('application/json')
    expect(respuesta.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(respuesta.headers.get('Cache-Control')).toBe('public, max-age=3600')
    expect(respuesta.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(await respuesta.json()).toHaveLength(5)
  })

  it('genera un sitemap absoluto y escapa el ampersand', async () => {
    const anterior = process.env.URL_PUBLICA
    try {
      process.env.URL_PUBLICA = 'https://ejemplo.test/camino?uno=1&dos=2'
      const respuesta = sitemap()
      const xml = await respuesta.text()
      expect(xml).toContain('https://ejemplo.test/camino?uno=1&amp;dos=2/')
      expect(respuesta.headers.get('Content-Type')).toContain('application/xml')
      expect(respuesta.headers.get('X-Content-Type-Options')).toBe('nosniff')
    } finally {
      if (anterior === undefined) delete process.env.URL_PUBLICA
      else process.env.URL_PUBLICA = anterior
    }
  })

  it('rechaza GET en el webhook y anuncia POST', () => {
    const respuesta = metodoAvisos()
    expect(respuesta.status).toBe(405)
    expect(respuesta.headers.get('Allow')).toBe('POST')
  })

  it('rechaza tokens ausentes, distintos aunque midan lo mismo y de longitud distinta', async () => {
    process.env.AVISOS_TOKEN = 'token-correcto-de-al-menos-32-caracteres'
    const cuerpo = JSON.stringify({ tipo: 'fiesta', texto: 'Mercado', hasta: '2099-01-01' })
    const sinToken = await guardarAviso(
      argumentos<Parameters<typeof guardarAviso>[0]>('/api/avisos', {
        init: { method: 'POST', body: cuerpo },
      })
    )
    const corto = await guardarAviso(
      argumentos<Parameters<typeof guardarAviso>[0]>('/api/avisos', {
        init: { method: 'POST', body: cuerpo, headers: { Authorization: 'Bearer x' } },
      })
    )
    const igualLongitud = await guardarAviso(
      argumentos<Parameters<typeof guardarAviso>[0]>('/api/avisos', {
        init: {
          method: 'POST',
          body: cuerpo,
          headers: { Authorization: `Bearer ${'x'.repeat(process.env.AVISOS_TOKEN.length)}` },
        },
      })
    )
    expect(estado(sinToken)).toBe(401)
    expect(estado(corto)).toBe(401)
    expect(estado(igualLongitud)).toBe(401)
  })

  it('valida el aviso, lo guarda y la portada lo lee', async () => {
    process.env.AVISOS_TOKEN = 'token-correcto-de-al-menos-32-caracteres'
    const headers = {
      Authorization: 'Bearer token-correcto-de-al-menos-32-caracteres',
      'Content-Type': 'application/json',
    }
    const malo = await guardarAviso(
      argumentos<Parameters<typeof guardarAviso>[0]>('/api/avisos', {
        init: { method: 'POST', headers, body: '{}' },
      })
    )
    const bueno = await guardarAviso(
      argumentos<Parameters<typeof guardarAviso>[0]>('/api/avisos', {
        init: {
          method: 'POST',
          headers,
          body: JSON.stringify({
            tipo: 'corte-agua',
            texto: 'Corte entre las 16:00 y las 18:00.',
            hasta: '2099-01-01',
          }),
        },
      })
    )
    expect(estado(malo)).toBe(400)
    const demasiadoLargo = await guardarAviso(
      argumentos<Parameters<typeof guardarAviso>[0]>('/api/avisos', {
        init: {
          method: 'POST',
          headers,
          body: JSON.stringify({ tipo: 'fiesta', texto: 'x'.repeat(281), hasta: '2099-01-01' }),
        },
      })
    )
    expect(estado(demasiadoLargo)).toBe(400)
    expect(estado(bueno)).toBe(201)
    await expect(portada()).resolves.toMatchObject({ aviso: { tipo: 'corte-agua' } })
  })

  it.each(['PUT', 'PATCH', 'DELETE'])(
    'rechaza %s en el webhook aunque el token sea válido',
    async (method) => {
      process.env.AVISOS_TOKEN = 'token-correcto-de-al-menos-32-caracteres'
      const respuesta = await guardarAviso(
        argumentos<Parameters<typeof guardarAviso>[0]>('/api/avisos', {
          init: {
            method,
            headers: { Authorization: `Bearer ${process.env.AVISOS_TOKEN}` },
            body: '{}',
          },
        })
      )
      expect(estado(respuesta)).toBe(405)
      expect((respuesta as Response).headers.get('Allow')).toBe('POST')
    }
  )

  it('guarda un PNG con un nombre generado y rechaza HTML', async () => {
    const png = new FormData()
    png.set(
      'credencial',
      new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], 'mi-credencial.png', {
        type: 'image/png',
      })
    )
    const guardada = await reserva(
      argumentos<Parameters<typeof reserva>[0]>('/hospitaleros/reservas/r-1', {
        params: { id: 'r-1' },
        init: { method: 'POST', body: png },
      })
    )
    expect(estado(guardada)).toBeUndefined()
    const nombres = await readdir(process.env.DIRECTORIO_SUBIDAS!)
    expect(nombres).toHaveLength(1)
    expect(nombres[0]).not.toBe('mi-credencial.png')
    expect(nombres[0]).toMatch(/\.png$/)
    await expect(buscarReserva('r-1')).resolves.toMatchObject({ credencial: nombres[0] })

    const html = new FormData()
    html.set('credencial', new File(['<h1>hola</h1>'], 'ataque.html', { type: 'text/html' }))
    const rechazada = await reserva(
      argumentos<Parameters<typeof reserva>[0]>('/hospitaleros/reservas/r-1', {
        params: { id: 'r-1' },
        init: { method: 'POST', body: html },
      })
    )
    expect(estado(rechazada)).toBe(400)
  })

  it('rechaza un PNG fingido y un archivo vacío aunque el MIME diga imagen', async () => {
    for (const contenido of ['<h1>ataque</h1>', '']) {
      const formulario = new FormData()
      formulario.set('credencial', new File([contenido], 'falso.png', { type: 'image/png' }))
      const resultado = await reserva(
        argumentos<Parameters<typeof reserva>[0]>('/hospitaleros/reservas/r-1', {
          params: { id: 'r-1' },
          init: { method: 'POST', body: formulario },
        })
      )
      expect(estado(resultado)).toBe(400)
    }
  })

  it('rechaza dos archivos y elimina el primero que ya hubiera escrito', async () => {
    const formulario = new FormData()
    const firma = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
    formulario.append('credencial', new File([firma], 'una.png', { type: 'image/png' }))
    formulario.append('credencial', new File([firma], 'dos.png', { type: 'image/png' }))
    const resultado = await reserva(
      argumentos<Parameters<typeof reserva>[0]>('/hospitaleros/reservas/r-1', {
        params: { id: 'r-1' },
        init: { method: 'POST', body: formulario },
      })
    )
    expect(estado(resultado)).toBe(400)
    const nombres = await readdir(process.env.DIRECTORIO_SUBIDAS!).catch((error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return []
      throw error
    })
    expect(nombres).toEqual([])
  })

  it('rechaza con 415 un cuerpo que no sea formulario', async () => {
    const resultado = await reserva(
      argumentos<Parameters<typeof reserva>[0]>('/hospitaleros/reservas/r-1', {
        params: { id: 'r-1' },
        init: { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
      })
    )
    expect(estado(resultado)).toBe(415)
  })

  it('rechaza una credencial de más de 2 MB con un 413', async () => {
    const limite = 'frontera-el-cea'
    const inicio = Buffer.from(
      `--${limite}\r\nContent-Disposition: form-data; name="credencial"; ` +
        `filename="grande.png"\r\nContent-Type: image/png\r\n\r\n`
    )
    const final = Buffer.from(`\r\n--${limite}--\r\n`)
    const cuerpo = Buffer.concat([inicio, Buffer.alloc(2 * 1024 * 1024 + 1), final])
    const resultado = await reserva(
      argumentos<Parameters<typeof reserva>[0]>('/hospitaleros/reservas/r-1', {
        params: { id: 'r-1' },
        init: {
          method: 'POST',
          headers: { 'Content-Type': `multipart/form-data; boundary=${limite}` },
          body: cuerpo as unknown as BodyInit,
        },
      })
    )
    expect(estado(resultado)).toBe(413)
  })

  it('declara maxFileSize de forma explícita', async () => {
    const fuente = await import('node:fs/promises').then(({ readFile }) =>
      readFile(new URL('../app/routes/hospitaleros/reserva.tsx', import.meta.url), 'utf8')
    )
    expect(fuente).toContain('maxFileSize: MAX_CREDENCIAL')
  })

  it('al sustituir una credencial borra el archivo anterior', async () => {
    const firma = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])
    for (const nombre of ['primera.png', 'segunda.png']) {
      const formulario = new FormData()
      formulario.set('credencial', new File([firma], nombre, { type: 'image/png' }))
      await reserva(
        argumentos<Parameters<typeof reserva>[0]>('/hospitaleros/reservas/r-1', {
          params: { id: 'r-1' },
          init: { method: 'POST', body: formulario },
        })
      )
    }
    const nombres = await readdir(process.env.DIRECTORIO_SUBIDAS!)
    expect(nombres).toHaveLength(1)
    await expect(buscarReserva('r-1')).resolves.toMatchObject({ credencial: nombres[0] })
  })
})
