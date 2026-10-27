import { describe, expect, it } from 'vitest'
import { aCsv, celdaCsv } from '~/csv'
import { loader } from '~/routes/reparto-csv'
import { argumentos, contextoDeSocio, JAVIER, PILAR } from './peticion'

type Args = Parameters<typeof loader>[0]

describe('Paso 5: la hoja de reparto, una ruta de recursos', () => {
  it('aCsv separa con punto y coma, empieza con la marca BOM y termina las filas con \\r\\n', () => {
    const csv = aCsv([
      ['Socio', 'Comentario'],
      ['Miguel Royo', 'Llegaré tarde; hacia las 12:30'],
      ['Lucía Abadía', 'Dice "sin bolsa"'],
    ])
    expect(csv).toBe(
      '\uFEFFSocio;Comentario\r\n' +
        'Miguel Royo;"Llegaré tarde; hacia las 12:30"\r\n' +
        'Lucía Abadía;"Dice ""sin bolsa"""\r\n',
    )
  })

  it('una celda que empieza por = + - o @ lleva un apóstrofo delante: así no es una fórmula', () => {
    expect(celdaCsv('=HYPERLINK("http://malo.example")')).toBe(`"'=HYPERLINK(""http://malo.example"")"`)
    expect(celdaCsv('+1 docena de huevos si sobran')).toBe("'+1 docena de huevos si sobran")
    expect(celdaCsv('-2 kilos')).toBe("'-2 kilos")
    expect(celdaCsv('@pilar')).toBe("'@pilar")
    expect(celdaCsv(3)).toBe('3')
  })

  it('un socio sin el rol de reparto recibe un 403', async () => {
    const { context } = await contextoDeSocio(PILAR)
    const hoja = await loader(argumentos<Args>('/socio/reparto.csv', { context }))
    expect(hoja.status).toBe(403)
  })

  it('la coordinación descarga un CSV con las líneas de la semana, por puntos de recogida', async () => {
    const { context } = await contextoDeSocio(JAVIER)
    const hoja = await loader(argumentos<Args>('/socio/reparto.csv', { context }))
    expect(hoja.status).toBe(200)
    expect(hoja.headers.get('Content-Type')).toBe('text/csv; charset=utf-8')
    expect(hoja.headers.get('Content-Disposition')).toBe('attachment; filename="hoja-de-reparto-semana-44.csv"')

    // text() se come la marca BOM al decodificar; con ignoreBOM, se queda.
    const lineas = new TextDecoder('utf-8', { ignoreBOM: true }).decode(await hoja.arrayBuffer()).split('\r\n')
    expect(lineas[0]).toBe('\uFEFFPunto de recogida;Día;Pedido;Socio;Teléfono;Producto;Formato;Cantidad;Comentario')
    // Diez líneas de pedido, más la de los títulos y la vacía del final.
    expect(lineas).toHaveLength(12)
    // Primero el Casco Histórico (el jueves antes que el viernes), después el Actur y al final Torrero.
    expect(lineas.slice(1, -1).map((l) => l.split(';')[2])).toEqual([
      'P-44-0004', 'P-44-0004',
      'P-44-0002', 'P-44-0002', 'P-44-0002',
      'P-44-0001', 'P-44-0001', 'P-44-0001',
      'P-44-0003', 'P-44-0003',
    ])
    expect(lineas).toContain(
      "Torrero, en la asociación vecinal;jueves 29, de 18:00 a 20:30;P-44-0003;Carmen Aznar;688778899;Melocotón de Calanda;kilo;2;'+1 docena de huevos si sobran",
    )
  })
})
