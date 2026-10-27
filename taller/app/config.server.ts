// L18/L22: estas variables solo viven en el servidor. Ninguna empieza por
// VITE_ porque Vite expondría su valor al código del navegador.
const SECRETO_DE_DESARROLLO = 'solo-para-desarrollo-no-lo-uses-en-produccion'
const TOKEN_DE_DESARROLLO = 'avisos-solo-desarrollo'

export function secretosDeSesion(entorno: NodeJS.ProcessEnv = process.env): string[] {
  // L18: el primer secreto firma y los siguientes conservan válidas las cookies
  // durante una rotación; todos deben ser largos en producción.
  const secretos = (entorno.SECRETO_SESION ?? '')
    .split(',')
    .map((secreto) => secreto.trim())
    .filter(Boolean)
  if (secretos.length > 0) {
    if (entorno.NODE_ENV === 'production' && secretos.some((secreto) => secreto.length < 32))
      throw new Error('Cada valor de SECRETO_SESION debe tener al menos 32 caracteres en producción.')
    return secretos
  }
  if (entorno.NODE_ENV === 'production') {
    throw new Error('Falta SECRETO_SESION: no se pueden firmar las cookies de sesión.')
  }
  return [SECRETO_DE_DESARROLLO]
}

export function tokenDeAvisos(entorno: NodeJS.ProcessEnv = process.env): string {
  // L19/L22: AVISOS_TOKEN autentica el webhook y no comparte la firma de sesión.
  if (entorno.AVISOS_TOKEN) {
    if (entorno.NODE_ENV === 'production' && entorno.AVISOS_TOKEN.length < 32)
      throw new Error('AVISOS_TOKEN debe tener al menos 32 caracteres en producción.')
    return entorno.AVISOS_TOKEN
  }
  if (entorno.NODE_ENV === 'production')
    throw new Error('Falta AVISOS_TOKEN: el webhook de avisos queda desactivado.')
  return TOKEN_DE_DESARROLLO
}

export function urlPublica(entorno: NodeJS.ProcessEnv = process.env): string {
  // L19: URL_PUBLICA no es secreta; fija el origen absoluto que publica el sitemap.
  return (entorno.URL_PUBLICA ?? 'https://albergue-el-cea.es').replace(/\/$/, '')
}
