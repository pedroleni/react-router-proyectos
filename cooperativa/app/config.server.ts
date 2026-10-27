// Los secretos con los que se firma la cookie de sesión. Salen de la variable
// de entorno SECRETO_SESION, que solo existe en el servidor: este módulo es
// .server y nunca llega al navegador.
//
// Para rotarlos sin echar a nadie, pon el nuevo delante y deja el viejo detrás,
// separados por comas: SECRETO_SESION="nuevo,viejo". Se firma con el primero y
// se aceptan cookies firmadas con cualquiera de los dos.

const SECRETO_DE_DESARROLLO = 'solo-para-desarrollo-no-lo-uses-en-produccion'

export function secretosDeSesion(entorno: NodeJS.ProcessEnv = process.env): string[] {
  // TODO (paso 10): lee entorno.SECRETO_SESION, sepáralo por comas, quita los
  // espacios y descarta los vacíos. Si queda alguno, devuélvelos. Si no:
  // - en producción (entorno.NODE_ENV === 'production'), lanza un Error con el
  //   mensaje 'Falta la variable de entorno SECRETO_SESION: sin ella no se
  //   pueden firmar las cookies de sesión.' (mejor no arrancar que firmar con
  //   un secreto que está en el repositorio);
  // - en desarrollo, devuelve [SECRETO_DE_DESARROLLO].
  void entorno
  return [SECRETO_DE_DESARROLLO]
}
