import type { Etapa } from '~/tipos'

// Distancias aproximadas para orientar al peregrino, no una medición oficial.
export const ETAPAS: Etapa[] = [
  {
    slug: 'terradillos-de-los-templarios-sahagun',
    origen: 'Terradillos de los Templarios',
    destino: 'Sahagún',
    kilometros: 13,
    descripcion: 'Una llegada suave entre campos de cereal, con el santuario de La Peregrina al final.',
  },
  {
    slug: 'carrion-de-los-condes-terradillos',
    origen: 'Carrión de los Condes',
    destino: 'Terradillos de los Templarios',
    kilometros: 26.6,
    descripcion: 'Una jornada larga y llana por la meseta palentina antes de entrar en León.',
  },
  {
    slug: 'sahagun-el-burgo-ranero',
    origen: 'Sahagún',
    destino: 'El Burgo Ranero',
    kilometros: 17.9,
    descripcion: 'La salida clásica por Bercianos del Real Camino y la llanura leonesa.',
  },
  {
    slug: 'sahagun-calzadilla-de-los-hermanillos',
    origen: 'Sahagún',
    destino: 'Calzadilla de los Hermanillos',
    kilometros: 22,
    descripcion: 'La variante tranquila de la Calzada Romana, con largos tramos sin servicios.',
  },
  {
    slug: 'el-burgo-ranero-mansilla-de-las-mulas',
    origen: 'El Burgo Ranero',
    destino: 'Mansilla de las Mulas',
    kilometros: 19,
    descripcion: 'Una etapa abierta y horizontal que acerca el Camino a la ciudad de León.',
  },
]

export function buscarEtapa(slug: string | undefined): Etapa | null {
  return ETAPAS.find((etapa) => etapa.slug === slug) ?? null
}
