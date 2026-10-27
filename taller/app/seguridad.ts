export function destinoProvisional(_volver: FormDataEntryValue | null, _porDefecto: string): string {
  // TODO (lección 18): reutiliza la comprobación de la lección 13 para el destino
  // de vuelta: resuélvelo con new URL sobre un origen ficticio y devuelve solo
  // rutas de ese mismo origen. Si no, porDefecto. La lección 20 la endurece.
  throw new Error('TODO (lección 18): destino provisional.')
}

export function destinoSeguro(_volver: FormDataEntryValue | null, _porDefecto: string): string {
  // TODO (lección 20): acepta solo rutas internas inequívocas, sin controles,
  // barras inversas ni bucles de entrada/salida. Busca URL y open redirects.
  throw new Error('TODO (lección 20): destino interno seguro.')
}
