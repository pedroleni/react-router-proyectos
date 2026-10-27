import type { DataStrategyResult, MiddlewareFunction } from 'react-router'

export const clientMiddleware: MiddlewareFunction<Record<string, DataStrategyResult>> = async () => {
  // TODO (lección 16): mide la navegación, llama a next y devuelve exactamente
  // su resultado. Busca Client Middleware.
  throw new Error('TODO (lección 16): middleware de navegación.')
}
