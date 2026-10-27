import { useEffect, useRef } from 'react'
import { data, Form, redirect, useNavigation } from 'react-router'
import { comprobarCredenciales, buscarSocio } from '~/datos/socios.server'
import { destinoSeguro } from '~/seguridad'
import { guardarSesion, leerSesion } from '~/sesiones.server'
import type { Route } from './+types/entrar'

export async function loader({ request }: Route.LoaderArgs) {
  const volver = destinoSeguro(new URL(request.url).searchParams.get('volver'), request)
  // Si ya has entrado, no tiene sentido enseñarte el formulario.
  const sesion = await leerSesion(request)
  if (buscarSocio(sesion.get('socioId'))) throw redirect(volver)
  return { volver }
}

export async function action({ request }: Route.ActionArgs) {
  const formulario = await request.formData()
  const correo = String(formulario.get('correo') ?? '')
  const clave = String(formulario.get('clave') ?? '')
  // El destino se vuelve a validar aquí: el campo oculto también se puede cambiar.
  const volver = destinoSeguro(formulario.get('volver'), request)

  const socio = await comprobarCredenciales(correo, clave)
  if (!socio) {
    // Un solo mensaje para los dos casos: no decimos si el correo existe.
    return data({ error: 'El correo o la contraseña no son correctos.', correo }, { status: 400 })
  }

  const sesion = await leerSesion(request)
  sesion.set('socioId', socio.id)
  return redirect(volver, { headers: { 'Set-Cookie': await guardarSesion(sesion) } })
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
