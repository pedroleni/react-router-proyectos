import { urlPublica } from '~/config.server'
import { ETAPAS } from '~/datos/etapas'

function escaparXml(valor: string): string {
  // L19: el escape mantiene XML válido aunque URL_PUBLICA incluya caracteres reservados.
  return valor
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

export function loader() {
  // L19: los buscadores necesitan URL absolutas, no rutas relativas de la aplicación.
  const base = urlPublica()
  const rutas = [
    '/',
    '/albergue',
    '/etapas',
    '/camas',
    '/reservar',
    ...ETAPAS.map((etapa) => `/etapas/${etapa.slug}`),
  ]
  const entradas = rutas
    .map((ruta) => `  <url><loc>${escaparXml(`${base}${ruta}`)}</loc></url>`)
    .join('\n')
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entradas}\n</urlset>\n`
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
