import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter
        // L22: onError observa fallos de navegación tras hidratar, que ya no pasan
        // por el manejador de errores del documento servidor.
        onError={(error, informacion) =>
          console.error('Error en el navegador', { error, ruta: informacion.location.pathname })
        }
      />
    </StrictMode>,
  )
})
