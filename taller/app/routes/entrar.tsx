import { z } from 'zod'
import { data, Form, href, redirect, useNavigation } from 'react-router'
import { comprobarCredenciales, buscarHospitalero } from '~/datos/hospitaleros.server'
import { destinoSeguro } from '~/seguridad'
import { guardarSesion, leerSesion } from '~/sesiones.server'
import type { Route } from './+types/entrar'

const Credenciales = z.object({ usuario: z.string().min(1), clave: z.string().min(1) })
const MENSAJE = 'El usuario o la contraseña no son correctos.'

export async function loader({ request }: Route.LoaderArgs) {
  // L18/L20: si ya hay sesión se vuelve al destino, siempre saneado para evitar
  // que `volver` convierta el login en una redirección abierta.
  const volver = destinoSeguro(new URL(request.url).searchParams.get('volver'), href('/hospitaleros'))
  const sesion = await leerSesion(request)
  if (buscarHospitalero(sesion.get('hospitaleroId'))) throw redirect(volver)
  return { volver }
}

export async function action({ request }: Route.ActionArgs) {
  const formulario = await request.formData()
  const volver = destinoSeguro(formulario.get('volver'), href('/hospitaleros'))
  const valores = Credenciales.safeParse(Object.fromEntries(formulario))
  const hospitalero = valores.success
    ? await comprobarCredenciales(valores.data.usuario, valores.data.clave)
    : null
  if (!hospitalero)
    // L18: el mismo mensaje evita revelar si el usuario existe.
    return data({ error: MENSAJE, usuario: String(formulario.get('usuario') ?? '') }, { status: 400 })
  const sesion = await leerSesion(request)
  sesion.set('hospitaleroId', hospitalero.id)
  sesion.set('inicio', Date.now())
  return redirect(volver, { headers: { 'Set-Cookie': await guardarSesion(sesion) } })
}

export default function Entrar({ loaderData, actionData }: Route.ComponentProps) {
  const navegacion = useNavigation()
  return (
    <main className="pagina estrecha acceso">
      <title>Entrar | Hospitaleros de El Cea</title>
      <h1>Zona de hospitaleros</h1>
      <p>Acceso para el turno que atiende el albergue.</p>
      <Form method="post" className="formulario">
        <input type="hidden" name="volver" value={loaderData.volver} />
        <div className="campo">
          <label htmlFor="usuario">Usuario</label>
          <input
            id="usuario"
            name="usuario"
            autoComplete="username"
            defaultValue={actionData?.usuario}
            required
          />
        </div>
        <div className="campo">
          <label htmlFor="clave">Contraseña</label>
          <input
            id="clave"
            name="clave"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!actionData?.error}
            aria-describedby={actionData?.error ? 'entrar-error' : undefined}
            required
          />
        </div>
        {actionData?.error && (
          <p id="entrar-error" className="error" role="alert">
            {actionData.error}
          </p>
        )}
        <button type="submit" disabled={navegacion.state === 'submitting'}>
          {navegacion.state === 'submitting' ? 'Entrando…' : 'Entrar'}
        </button>
      </Form>
    </main>
  )
}
