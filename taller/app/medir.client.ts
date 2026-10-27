import type { DataStrategyResult, MiddlewareFunction } from 'react-router'

// L16: `.client` impide meter este medidor del navegador en el bundle servidor;
// mide la navegación completa, incluido el trabajo de loaders del cliente.
export const clientMiddleware: MiddlewareFunction<Record<string, DataStrategyResult>> = async (
  _argumentos,
  next,
) => {
  const inicio = performance.now()
  const resultado = await next()
  console.debug(`Navegación completada en ${Math.round(performance.now() - inicio)} ms`)
  return resultado
}
