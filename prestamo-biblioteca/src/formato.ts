const formatoFecha = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', timeZone: 'UTC' })

// «2026-10-19» → «19 de octubre»
export function fechaLarga(iso: string) {
  return formatoFecha.format(new Date(`${iso}T00:00:00Z`))
}
