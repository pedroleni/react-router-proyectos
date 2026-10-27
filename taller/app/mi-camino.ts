import { z } from 'zod/mini'
import { ETAPAS } from '~/datos/etapas'

const CLAVE_MI_CAMINO = 'el-cea:mi-camino'
// L16: zod/mini conserva esta validación sin enviar Zod completo al navegador.
const ListaDeSlugs = z.array(z.string())
const slugsConocidos = new Set(ETAPAS.map((etapa) => etapa.slug))

export function leerMiCamino(): string[] {
  try {
    const resultado = ListaDeSlugs.safeParse(JSON.parse(localStorage.getItem(CLAVE_MI_CAMINO) ?? '[]'))
    return resultado.success ? [...new Set(resultado.data.filter((slug) => slugsConocidos.has(slug)))] : []
  } catch {
    return []
  }
}

export function anadirAMiCamino(slug: string): void {
  if (!slugsConocidos.has(slug)) return
  localStorage.setItem(CLAVE_MI_CAMINO, JSON.stringify([...new Set([...leerMiCamino(), slug])]))
}
