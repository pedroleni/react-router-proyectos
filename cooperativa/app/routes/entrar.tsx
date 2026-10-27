import { useEffect, useRef } from 'react'
import { data, Form, useNavigation } from 'react-router'
import { destinoSeguro } from '~/seguridad'
import type { Route } from './+types/entrar'

export async function loader({ request }: Route.LoaderArgs) {
  const volver = destinoSeguro(new URL(request.url).searchParams.get('volver'), request)
  // TODO (paso 1): si la sesión (leerSesion) ya tiene un socio que existe
  // (buscarSocio), no enseñes el formulario: lanza un redirect a volver.
  return { volver }
}

export async function action({ request }: Route.ActionArgs) {
  const formulario = await request.formData()
  const correo = String(formulario.get('correo') ?? '')
  // El destino se vuelve a validar aquí: el campo oculto también se puede cambiar.
  const volver = destinoSeguro(formulario.get('volver'), request)

  // TODO (paso 1): comprueba el correo y la contraseña (campo «clave») con
  // comprobarCredenciales.
  // - Si no valen, devuelve con data() un 400 con
  //   { error: 'El correo o la contraseña no son correctos.', correo }:
  //   un solo mensaje para los dos casos, sin decir si el correo existe.
  // - Si valen, lee la sesión, guarda en ella el socioId y devuelve un
  //   redirect a volver con la cabecera Set-Cookie de guardarSesion(sesion).
  void volver
  return data({ error: 'Todavía no se puede entrar: falta el paso 1.', correo }, { status: 501 })
}

export default function Entrar({ loaderData, actionData }: Route.ComponentProps) {
  const navegacion = useNavigation()
  const entrando = navegacion.state === 'submitting'
  const clave = useRef<HTMLInputElement>(null)

  // Tras un error, la contraseña se borra y recibe el foco.
  useEffect(() => {
    if (actionData?.error && clave.current) {
      clave.current.value = ''
      clave.current.focus()
    }
  }, [actionData])

  return (
    <main className="pagina estrecha">
      <title>Entrar · La Huerta del Ebro</title>
      <h1>Zona de socios</h1>
      <p>Entra con el correo y la contraseña que te dieron al hacerte socio.</p>
      <Form method="post" className="formulario">
        <input type="hidden" name="volver" value={loaderData.volver} />
        <div className="campo">
          <label htmlFor="correo">Correo</label>
          <input
            id="correo"
            name="correo"
            type="email"
            autoComplete="username"
            required
            defaultValue={actionData?.correo}
          />
        </div>
        <div className="campo">
          <label htmlFor="clave">Contraseña</label>
          <input
            id="clave"
            ref={clave}
            name="clave"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={actionData?.error ? true : undefined}
            aria-describedby={actionData?.error ? 'entrar-error' : undefined}
          />
        </div>
        {actionData?.error && (
          <p id="entrar-error" role="alert" className="error">
            {actionData.error}
          </p>
        )}
        <button type="submit" disabled={entrando}>
          {entrando ? 'Entrando…' : 'Entrar'}
        </button>
      </Form>
    </main>
  )
}
