import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Wallet, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { EMAIL_REGEX } from '../utils/constants'

/**
 * Pagina de solicitud de recuperacion de contrasena.
 *
 * Flujo:
 * 1. El usuario ingresa su correo electronico.
 * 2. Se envia un enlace de recuperacion por correo (via Supabase Auth).
 * 3. Se muestra un mensaje de confirmacion NEUTRAL, sin revelar
 *    si el correo esta registrado o no (seguridad anti-enumeracion).
 * 4. El usuario puede volver a Login o solicitar otro enlace.
 */
export default function ForgotPassword() {
  const { solicitarRecuperacion } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [enviado, setEnviado] = useState(false)

  const validate = () => {
    const e = {}
    if (!email) e.email = 'El correo es obligatorio'
    else if (!EMAIL_REGEX.test(email)) e.email = 'Correo no válido'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    try {
      setLoading(true)
      const mensaje = await solicitarRecuperacion({ email })
      setEnviado(true)
      toast.success(mensaje)
    } catch (err) {
      const msg = err?.message || 'No se pudo enviar el correo de recuperación. Intenta nuevamente.'
      setServerError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#f8f9fa] font-body text-[#191c1d] min-h-screen">
      <main className="flex min-h-screen">
        {/* ---------- Panel izquierdo decorativo ---------- */}
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
              Recuperación segura
            </span>
            <h1 className="font-headline font-extrabold text-white text-5xl xl:text-6xl tracking-tighter leading-tight mb-8">
              Recupera tu acceso.
            </h1>
            <p className="text-white/90 text-xl leading-relaxed font-medium">
              Te enviaremos un enlace seguro a tu correo para que puedas establecer una nueva contraseña.
            </p>
          </div>

          <div className="absolute bottom-12 left-16 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-headline font-bold text-white text-xl tracking-tighter">FinanzasU</span>
          </div>
        </section>

        {/* ---------- Formulario ---------- */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-[#f8f9fa]">
          <div className="w-full max-w-md animate-fade-in">
            {/* Logo movil */}
            <div className="lg:hidden flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-lg editorial-gradient flex items-center justify-center shadow-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-headline font-extrabold text-[#24389c] text-2xl tracking-tighter">FinanzasU</span>
            </div>

            <div className="mb-10">
              <h2 className="font-headline font-extrabold text-4xl tracking-tight mb-3">
                {enviado ? 'Correo enviado' : '¿Olvidaste tu contraseña?'}
              </h2>
              <p className="text-[#454652] font-medium">
                {enviado
                  ? 'Si el correo está registrado, recibirás un enlace de recuperación en tu bandeja de entrada.'
                  : 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.'}
              </p>
            </div>

            {!enviado ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold ml-1" htmlFor="recovery-email">
                    Correo electrónico
                  </label>
                  <div className="login-field-wrap relative group">
                    <span className="login-field-icon text-[#757684]">✉️</span>
                    <input
                      id="recovery-email"
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
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-800 text-sm">
                  <p className="font-semibold mb-1">✅ Revisa tu bandeja de entrada</p>
                  <p>
                    Si el correo <strong>{email}</strong> está asociado a una cuenta,
                    recibirás un enlace de recuperación. También revisa tu carpeta de spam.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEnviado(false)
                    setEmail('')
                    setServerError('')
                  }}
                  className="w-full py-4 border-2 border-[#24389c] text-[#24389c] font-bold rounded-xl hover:bg-[#24389c]/5 active:scale-[0.98] transition-all duration-200 text-lg"
                  type="button"
                >
                  Solicitar otro enlace
                </button>
              </div>
            )}

            <div className="mt-12 text-center">
              <Link
                className="inline-flex items-center gap-2 text-[#24389c] font-bold hover:underline"
                to="/login"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a iniciar sesión
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
