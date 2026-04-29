import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { AtSign, Lock, User, Wallet } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { EMAIL_REGEX, PASSWORD_MIN_LENGTH } from '../utils/constants'

export default function Register() {
  const { registrar } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')

  const validate = () => {
    const e = {}
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!email) e.email = 'El correo es obligatorio'
    else if (!EMAIL_REGEX.test(email)) e.email = 'Correo no válido'
    if (!password) e.password = 'La contraseña es obligatoria'
    else if (password.length < PASSWORD_MIN_LENGTH) {
      e.password = `Mínimo ${PASSWORD_MIN_LENGTH} caracteres`
    }
    if (password !== confirmPassword) e.confirmPassword = 'Las contraseñas no coinciden'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return
    try {
      setLoading(true)
      const data = await registrar({ nombre, email, password })
      toast.success('Cuenta creada correctamente.')
      if (data.session) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', {
          replace: true,
          state: {
            mensaje: 'Cuenta creada. Revisa tu correo para confirmar el acceso antes de iniciar sesión.'
          }
        })
      }
    } catch (err) {
      const msg = err?.message || 'Error al registrarse. Intenta de nuevo.'
      setServerError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#f8f9fa] font-body text-[#191c1d]">
      <section
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #006d36 0%, #005227 100%)' }}
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px]" style={{ background: '#83fba5' }} />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px]" style={{ background: '#24389c' }} />
        </div>
        <div className="relative z-10 p-16 max-w-2xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white text-sm backdrop-blur-md mb-6">
            Tu futuro financiero comienza aquí
          </span>
          <h1 className="font-headline font-extrabold text-white text-6xl tracking-tighter leading-tight mb-8">
            Únete a la<br />Comunidad<br />FinanzasU.
          </h1>
          <p className="text-[#83fba5] text-xl leading-relaxed font-medium">
            Miles de estudiantes ya controlan sus finanzas de manera inteligente.
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
            <h2 className="font-headline font-extrabold text-4xl tracking-tight mb-3">Crear cuenta.</h2>
            <p className="text-[#454652] font-medium">Completa el formulario y comienza a gestionar tus finanzas.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold ml-1" htmlFor="reg-nombre">Nombre completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757684] group-focus-within:text-[#24389c] transition-colors" />
                <input
                  id="reg-nombre"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value)
                    setErrors((p) => ({ ...p, nombre: '' }))
                  }}
                  className={`w-full pl-12 pr-4 py-4 bg-white border rounded-xl focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all duration-200 placeholder:text-[#757684]/50 outline-none ${errors.nombre ? 'border-red-600' : 'border-[#c5c5d4]/40'}`}
                />
              </div>
              {errors.nombre && <p className="text-xs text-red-700 ml-1">{errors.nombre}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold ml-1" htmlFor="reg-email">Correo universitario</label>
              <div className="relative group">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757684] group-focus-within:text-[#24389c] transition-colors" />
                <input
                  id="reg-email"
                  type="email"
                  placeholder="nombre@universidad.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setErrors((p) => ({ ...p, email: '' }))
                  }}
                  className={`w-full pl-12 pr-4 py-4 bg-white border rounded-xl focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all duration-200 placeholder:text-[#757684]/50 outline-none ${errors.email ? 'border-red-600' : 'border-[#c5c5d4]/40'}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-700 ml-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold ml-1" htmlFor="reg-password">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757684] group-focus-within:text-[#24389c] transition-colors" />
                <input
                  id="reg-password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors((p) => ({ ...p, password: '' }))
                  }}
                  className={`w-full pl-12 pr-4 py-4 bg-white border rounded-xl focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all duration-200 placeholder:text-[#757684]/50 outline-none ${errors.password ? 'border-red-600' : 'border-[#c5c5d4]/40'}`}
                />
              </div>
              {errors.password && <p className="text-xs text-red-700 ml-1">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold ml-1" htmlFor="reg-confirm">Confirmar contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757684] group-focus-within:text-[#24389c] transition-colors" />
                <input
                  id="reg-confirm"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    setErrors((p) => ({ ...p, confirmPassword: '' }))
                  }}
                  className={`w-full pl-12 pr-4 py-4 bg-white border rounded-xl focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all duration-200 placeholder:text-[#757684]/50 outline-none ${errors.confirmPassword ? 'border-red-600' : 'border-[#c5c5d4]/40'}`}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-700 ml-1">{errors.confirmPassword}</p>}
            </div>

            {serverError && (
              <p className="text-red-700 text-sm bg-red-50 px-3 py-2 rounded-lg">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 editorial-gradient text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200 text-lg disabled:opacity-60"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-12 text-center">
            <p className="text-[#454652] font-medium">
              ¿Ya tienes cuenta?
              <Link to="/login" className="text-[#24389c] font-bold hover:underline ml-1">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}