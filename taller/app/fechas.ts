import { z } from 'zod'

const FORMATO_SAHAGUN = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' })

export function hoyEnSahagun(ahora = new Date()): string {
  return FORMATO_SAHAGUN.format(ahora)
}

function fechaReal(valor: string): boolean {
  const [ano, mes, dia] = valor.split('-').map(Number)
  const fecha = new Date(Date.UTC(ano, mes - 1, dia))
  return (
    fecha.getUTCFullYear() === ano && fecha.getUTCMonth() === mes - 1 && fecha.getUTCDate() === dia
  )
}

export const FechaIsoReal = z.iso
  .date('Elige una fecha válida.')
  .refine(fechaReal, 'Elige una fecha que exista.')

