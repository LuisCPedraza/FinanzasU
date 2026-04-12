import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const MENSAJES_ERROR = {
  requerido: 'Este campo es obligatorio.',
  nombreMinimo: 'El nombre debe tener al menos 2 caracteres.',
  emailInvalido: 'Ingresa un correo electronico valido.',
  passwordMinima: 'La contrasena debe tener al menos 6 caracteres.',
}

function validarCampo(nombre, valor) {
  const limpio = valor.trim()

  if (!limpio) return MENSAJES_ERROR.requerido

  if (nombre === 'nombre' && limpio.length < 2) {
    return MENSAJES_ERROR.nombreMinimo
  }

  if (nombre === 'email') {
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)
    if (!emailValido) return MENSAJES_ERROR.emailInvalido
  }

  if (nombre === 'password' && limpio.length < 6) {
    return MENSAJES_ERROR.passwordMinima
  }

  return ''
}

function normalizarErrorRegistro(err) {
  const status = Number(err?.status || err?.statusCode || 0)
  const rawMessage = String(err?.message || '').toLowerCase()

  if (status === 429 || rawMessage.includes('rate limit')) {
    return 'Superaste temporalmente el limite de registro por correo. Espera unos minutos e intenta de nuevo.'
  }

  if (rawMessage.includes('already registered') || rawMessage.includes('already exists')) {
    return 'Este correo ya esta registrado. Intenta iniciar sesion.'
  }

  if (rawMessage.includes('password') && rawMessage.includes('at least')) {
    return MENSAJES_ERROR.passwordMinima
  }

  return 'No pudimos crear tu cuenta. Intenta de nuevo.'
}

export default function Register() {
  const { registrar } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', email: '', password: '' })
  const [errores, setErrores] = useState({})
  const [tocados, setTocados] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [cargando, setCargando] = useState(false)

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
      nombre: validarCampo('nombre', form.nombre),
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
    setTocados({ nombre: true, email: true, password: true })

    if (!validarFormulario()) return

    setCargando(true)
    try {
      const data = await registrar({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      if (data.session) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', {
          replace: true,
          state: {
            mensaje: 'Cuenta creada. Revisa tu correo para confirmar el acceso antes de iniciar sesion.',
          },
        })
      }
    } catch (err) {
      setErrorGeneral(normalizarErrorRegistro(err))
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
          Crea tu cuenta gratuita
        </p>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            id="register-name"
            name="nombre"
            type="text"
            label="Nombre completo"
            placeholder="Tu nombre"
            autoComplete="name"
            value={form.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            error={tocados.nombre ? errores.nombre : ''}
            disabled={cargando}
          />

          <Input
            id="register-email"
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
            id="register-password"
            name="password"
            type="password"
            label="Contrasena"
            placeholder="Minimo 6 caracteres"
            autoComplete="new-password"
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

          <Button type="submit" loading={cargando} loadingText="Creando cuenta...">
            Registrarse
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline font-medium">
            Iniciar sesion
          </Link>
        </p>
      </div>
    </div>
  )
}