import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const MENSAJES_ERROR = {
  requerido: 'Este campo es obligatorio.',
  emailInvalido: 'Ingresa un correo electronico valido.',
  passwordMinima: 'La contrasena debe tener al menos 6 caracteres.',
}

function validarCampo(nombre, valor) {
  const limpio = valor.trim()

  if (!limpio) return MENSAJES_ERROR.requerido

  if (nombre === 'email') {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)
    if (!emailValido) return MENSAJES_ERROR.emailInvalido
  }

  if (nombre === 'password' && limpio.length < 6) {
    return MENSAJES_ERROR.passwordMinima
  }

  return ''
}

function normalizarErrorLogin(err) {
  const status = Number(err?.status || err?.statusCode || 0)
  const rawMessage = String(err?.message || '').toLowerCase()

  if (status === 429 || rawMessage.includes('rate limit')) {
    return 'Hay demasiados intentos en este momento. Espera unos minutos e intenta de nuevo.'
  }

  if (rawMessage.includes('email not confirmed')) {
    return 'Tu correo aun no esta confirmado. Revisa tu bandeja o solicita un nuevo correo de confirmacion.'
  }

  if (rawMessage.includes('invalid login credentials')) {
    return 'Correo o contrasena incorrectos.'
  }

  return 'No pudimos iniciar sesion con esos datos. Verifica e intenta de nuevo.'
}

export default function Login() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errores, setErrores] = useState({})
  const [tocados, setTocados] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)
  const mensaje = location.state?.mensaje || ''

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (tocados[name]) {
      setErrores((prev) => ({
        ...prev,
        [name]: validarCampo(name, value),
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTocados((prev) => ({ ...prev, [name]: true }))
    setErrores((prev) => ({
      ...prev,
      [name]: validarCampo(name, value),
    }))
  }

  const validarFormulario = () => {
    const nuevosErrores = {
      email: validarCampo('email', form.email),
      password: validarCampo('password', form.password),
    }

    setErrores(nuevosErrores)

    return Object.values(nuevosErrores).every((mensajeError) => !mensajeError)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (cargando) return
    setErrorGeneral('')
    setTocados({ email: true, password: true })

    if (!validarFormulario()) return

    setCargando(true)
    try {
      await iniciarSesion({
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErrorGeneral(normalizarErrorLogin(err))
    } finally {
      setCargando(false)
    }
  }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-indigo-600 mb-2">
            FinanzasU
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Inicia sesión para continuar
          </p>
          {mensaje && (
            <p role="status" className="text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg mb-4 wrap-break-word">
              {mensaje}
            </p>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="login-email"
              name="email"
              type="email"
              label="Correo electronico"
              placeholder="tu@correo.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={tocados.email ? errores.email : ''}
              disabled={cargando}
            />

            <Input
              id="login-password"
              name="password"
              type="password"
              label="Contrasena"
              placeholder="Minimo 6 caracteres"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              error={tocados.password ? errores.password : ''}
              disabled={cargando}
            />

            {errorGeneral && (
              <p role="alert" className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg wrap-break-word">
                {errorGeneral}
              </p>
            )}

            <Button type="submit" loading={cargando} loadingText="Ingresando...">
              Iniciar sesion
            </Button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-indigo-600 hover:underline font-medium">
              Registrate aqui
            </Link>
          </p>
        </div>
      </div>
    )
  }