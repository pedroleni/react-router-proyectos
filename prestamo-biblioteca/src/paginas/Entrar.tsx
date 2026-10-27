import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { destinoSeguro } from '../destino'
import { useSesion } from '../sesion'

export default function Entrar() {
  const { entrar } = useSesion()
  const navigate = useNavigate()
  const [parametros] = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // TODO (paso 3.2): una action en vez de onSubmit y fetch.
  async function manejarEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const datos = new FormData(evento.currentTarget)
    setEnviando(true)
    setError(null)
    try {
      const dentro = await entrar(String(datos.get('usuario')), String(datos.get('clave')))
      if (!dentro) {
        setError('Usuario o contraseña incorrectos.')
        return
      }
      navigate(destinoSeguro(parametros.get('volver'), window.location.origin), { replace: true })
    } catch {
      setError('No se ha podido iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="estrecha">
      <h1>Entrar</h1>
      <p>Solo para el personal de la biblioteca.</p>
      <form className="formulario" onSubmit={manejarEnvio}>
        {error && (
          <p role="alert" className="aviso-error">
            {error}
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
      </form>
    </section>
  )
}
