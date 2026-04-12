import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Wallet } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { EMAIL_REGEX } from '../utils/constants'

export default function Login() {
  const { iniciarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const mensaje = location.state?.mensaje || ''

  const validate = () => {
    const e = {}
    if (!email) e.email = 'El correo es obligatorio'
    else if (!EMAIL_REGEX.test(email)) e.email = 'Correo no válido'
    if (!password) e.password = 'La contraseña es obligatoria'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    try {
      setLoading(true)
      await iniciarSesion({ email, password })
      toast.success('Inicio de sesión exitoso.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg = err?.message || 'Correo o contraseña incorrectos.'
      setServerError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#f8f9fa] font-body text-[#191c1d] min-h-screen">
      <main className="flex min-h-screen">
        <section
          className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #24389c 0%, #3f51b5 100%)' }}
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div
              className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px]"
              style={{ background: '#83fba5' }}
            />
            <div
              className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px]"
              style={{ background: '#7c2500' }}
            />
          </div>

          <div className="relative z-10 p-16 max-w-2xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-sm backdrop-blur-md mb-6">
              Diseñado para estudiantes universitarios
            </span>
            <h1 className="font-headline font-extrabold text-white text-5xl xl:text-6xl tracking-tighter leading-tight mb-8">
              Finanzas ágiles y claras.
            </h1>
            <p className="text-white/90 text-xl leading-relaxed font-medium">
              Impulsamos a la nueva generación de líderes académicos con herramientas financieras inteligentes.
            </p>
          </div>

          <div className="absolute bottom-12 left-16 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-headline font-bold text-white text-xl tracking-tighter">FinanzasU</span>
          </div>
        </section>

        <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-[#f8f9fa]">
          <div className="w-full max-w-md animate-fade-in">
            <div className="lg:hidden flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-lg editorial-gradient flex items-center justify-center shadow-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-headline font-extrabold text-[#24389c] text-2xl tracking-tighter">FinanzasU</span>
            </div>

            <div className="mb-10">
              <h2 className="font-headline font-extrabold text-4xl tracking-tight mb-3">Bienvenido de nuevo.</h2>
              <p className="text-[#454652] font-medium">Continúa tu camino hacia la libertad financiera.</p>
            </div>

            {mensaje && (
              <p className="text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-lg mb-4">
                {mensaje}
              </p>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold ml-1" htmlFor="email">Correo universitario</label>
                <div className="login-field-wrap relative group">
                  <span className="login-field-icon text-[#757684]">✉️</span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="nombre@universidad.edu"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setErrors((p) => ({ ...p, email: undefined }))
                    }}
                    className={`login-input w-full pl-12 pr-4 py-4 border rounded-xl transition-all duration-200 placeholder:text-[#757684]/50 ${
                      errors.email ? 'border-red-600' : 'border-[#c5c5d4]/40'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-700 ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-sm font-semibold" htmlFor="password">Contraseña</label>
                </div>
                <div className="login-field-wrap relative group">
                  <span className="login-field-icon text-[#757684]">🔒</span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors((p) => ({ ...p, password: undefined }))
                    }}
                    className={`login-input w-full pl-12 pr-12 py-4 border rounded-xl transition-all duration-200 placeholder:text-[#757684]/50 ${
                      errors.password ? 'border-red-600' : 'border-[#c5c5d4]/40'
                    }`}
                  />
                  <button
                    className="login-plain-btn login-field-action text-[#757684]"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-700 ml-1">{errors.password}</p>}
              </div>

              <div className="flex items-center gap-3 px-1 py-2">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="login-checkbox w-5 h-5 rounded"
                />
                <label className="text-sm font-medium text-[#454652]" htmlFor="remember">Recordarme en este dispositivo</label>
              </div>

              {serverError && (
                <p className="text-red-700 text-sm bg-red-50 px-3 py-2 rounded-lg">
                  {serverError}
                </p>
              )}

              <button
                className="w-full py-4 editorial-gradient text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200 text-lg disabled:opacity-60"
                disabled={loading}
                type="submit"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[#454652] font-medium">
                ¿Nuevo en FinanzasU?
                <Link className="text-[#24389c] font-bold hover:underline ml-1" to="/register">Crear una cuenta</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}