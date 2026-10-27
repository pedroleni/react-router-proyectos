// Las dos ayudas con las que la app habla con la API de la biblioteca.

export class ErrorApi extends Error {
  estado: number

  constructor(estado: number) {
    super(`La API respondió con un ${estado}`)
    this.estado = estado
  }
}

// Pide JSON. Si la respuesta no es un 2xx, lanza un ErrorApi con su estado.
export async function pedirJson<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(ruta, opciones)
  if (!respuesta.ok) throw new ErrorApi(respuesta.status)
  return (await respuesta.json()) as T
}

// Envía JSON y devuelve la respuesta tal cual: quien llama mira el estado.
export function enviarJson(ruta: string, metodo: string, cuerpo?: unknown, signal?: AbortSignal) {
  return fetch(ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    signal,
  })
}
