import { data, Form, replace, useActionData, useNavigation, type ActionFunctionArgs } from 'react-router'
import { enviarJson } from '../api'
import { destinoSeguro } from '../destino'
import { sesionContext } from '../sesion'

export async function action({ request, context }: ActionFunctionArgs) {
  const datos = await request.formData()
  const respuesta = await enviarJson(
    '/api/sesion',
    'POST',
    { usuario: datos.get('usuario'), clave: datos.get('clave') },
    request.signal,
  )
  if (respuesta.status === 401) return data({ error: 'Usuario o contraseña incorrectos.' }, { status: 401 })
  if (!respuesta.ok) return data({ error: 'No se ha podido iniciar sesión. Inténtalo de nuevo.' }, { status: 500 })
  // La sesión ha cambiado: que la próxima lectura la vuelva a pedir.
  context.get(sesionContext).olvidar()
  const url = new URL(request.url)
  // replace, no redirect: el formulario de entrar no se queda en el historial,
  // como hacía navigate(volver, { replace: true }) en la 6.
  return replace(destinoSeguro(url.searchParams.get('volver'), url.origin))
}

export function Component() {
  const resultado = useActionData<typeof action>()
  const enviando = useNavigation().state === 'submitting'

  return (
    <section className="estrecha">
      <h1>Entrar</h1>
      <p>Solo para el personal de la biblioteca.</p>
      <Form method="post" className="formulario">
        {resultado?.error && (
          <p role="alert" className="aviso-error">
            {resultado.error}
          </p>
        )}
        <div className="campo">
          <label htmlFor="usuario">Usuario</label>
          <input id="usuario" name="usuario" autoComplete="username" required />
        </div>
        <div className="campo">
          <label htmlFor="clave">Contraseña</label>
          <input id="clave" name="clave" type="password" autoComplete="current-password" required />
        </div>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </Form>
    </section>
  )
}
