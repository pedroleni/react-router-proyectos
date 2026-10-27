import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      {/* TODO (lección 22): añade onError para los fallos de navegación del navegador. */}
      <HydratedRouter />
    </StrictMode>,
  )
})
