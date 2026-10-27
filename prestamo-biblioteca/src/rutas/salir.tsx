import { redirect, type ActionFunctionArgs } from 'react-router'
import { enviarJson, ErrorApi } from '../api'
import { sesionContext } from '../sesion'

// Solo una action: el botón «Cerrar sesión» de la cabecera envía aquí.
export async function action({ context }: ActionFunctionArgs) {
  const respuesta = await enviarJson('/api/sesion', 'DELETE')
  // Si la API no ha cerrado la sesión, no se hace como que sí: ni se olvida
  // la sesión ni se redirige.
  if (!respuesta.ok) throw new ErrorApi(respuesta.status)
  context.get(sesionContext).olvidar()
  return redirect('/catalogo')
}

export function ErrorBoundary() {
  return (
    <p role="alert" className="aviso-error">
      No se ha podido cerrar la sesión. Inténtalo de nuevo.
    </p>
  )
}
