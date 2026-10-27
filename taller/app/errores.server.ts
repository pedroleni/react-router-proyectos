export function informarError(
  _error: unknown,
  _contexto: { url: string; metodo: string },
): void {
  // TODO (lección 22): escribe una sola línea JSON y oculta la pila en
  // producción. Este es el punto de integración de un servicio como Sentry.
  throw new Error('TODO (lección 22): informe estructurado de errores.')
}
