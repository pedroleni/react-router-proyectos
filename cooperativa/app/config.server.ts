// Los secretos con los que se firma la cookie de sesión. Salen de la variable
// de entorno SECRETO_SESION, que solo existe en el servidor: este módulo es
// .server y nunca llega al navegador.
//
// Para rotarlos sin echar a nadie, pon el nuevo delante y deja el viejo detrás,
// separados por comas: SECRETO_SESION="nuevo,viejo". Se firma con el primero y
// se aceptan cookies firmadas con cualquiera de los dos.

const SECRETO_DE_DESARROLLO = 'solo-para-desarrollo-no-lo-uses-en-produccion'

export function secretosDeSesion(entorno: NodeJS.ProcessEnv = process.env): string[] {
  const secretos = (entorno.SECRETO_SESION ?? '')
    .split(',')
    .map((secreto) => secreto.trim())
    .filter(Boolean)
  if (secretos.length > 0) return secretos

  if (entorno.NODE_ENV === 'production') {
    // Mejor no arrancar que firmar con un secreto que está en el repositorio.
    throw new Error('Falta la variable de entorno SECRETO_SESION: sin ella no se pueden firmar las cookies de sesión.')
  }
  return [SECRETO_DE_DESARROLLO]
}
