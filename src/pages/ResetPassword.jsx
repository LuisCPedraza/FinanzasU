import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Wallet, ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { PASSWORD_MIN_LENGTH } from '../utils/constants'
import { supabase } from '../services/supabaseClient'

/**
 * Pagina para establecer una nueva contrasena despues de recibir
 * el enlace de recuperacion por correo.
 *
 * Flujo de Supabase:
 * 1. El usuario hace clic en el enlace del correo de recuperacion.
 * 2. Supabase redirige a esta pagina con tokens en el hash de la URL.
 * 3. El SDK de Supabase detecta los tokens y emite el evento
 *    PASSWORD_RECOVERY a traves de onAuthStateChange.
 * 4. Una vez que la sesion de recovery esta establecida, el usuario
 *    puede llamar a updateUser({ password }) para cambiar su contrasena.
 *
 * Si el enlace esta vencido o es invalido, se muestra un mensaje
 * de error con opcion de solicitar uno nuevo.
 *
 * Validaciones:
 * - Longitud minima (PASSWORD_MIN_LENGTH)
 * - Coincidencia entre ambos campos
 *
 * Al completar exitosamente, se muestra confirmacion y se redirige a /login.
 */
export default function ResetPassword() {
  const { cambiarContrasena } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [enlaceInvalido, setEnlaceInvalido] = useState(false)
  const [verificandoEnlace, setVerificandoEnlace] = useState(true)
  const [sesionRecoveryLista, setSesionRecoveryLista] = useState(false)
  const timeoutRef = useRef(null)

  // ---------------------------------------------------------------
  // Escuchar el evento PASSWORD_RECOVERY de Supabase.
  //
  // Cuando el usuario llega con un enlace de recovery valido,
  // el SDK de Supabase procesa los tokens del hash automaticamente
  // y emite el evento PASSWORD_RECOVERY. Eso significa que la sesion
  // temporal ya esta establecida y podemos llamar a updateUser.
  //
  // Si el hash contiene un error explicito (enlace vencido, invalido),
  // lo detectamos directamente de la URL.
  //
  // Si pasan mas de 5 segundos sin recibir el evento, consideramos
  // que el enlace es invalido o ya fue utilizado.
  // ---------------------------------------------------------------
  useEffect(() => {
    // 1. Verificar si la URL contiene errores explicitos de Supabase
    const hash = window.location.hash
    const params = new URLSearchParams(hash.replace('#', '?'))
    const errorCode = params.get('error_code')
    const errorDescription = params.get('error_description')

    if (errorCode || errorDescription) {
      setEnlaceInvalido(true)
      setServerError(
        errorDescription
          ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
          : 'El enlace de recuperación es inválido o ha expirado.'
      )
      setVerificandoEnlace(false)
      return
    }

    // 2. Escuchar el evento PASSWORD_RECOVERY de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (evento, session) => {
        if (evento === 'PASSWORD_RECOVERY' && session) {
          // Sesion de recovery establecida exitosamente
          setSesionRecoveryLista(true)
          setVerificandoEnlace(false)
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
          }
        }
      }
    )

    // 3. Verificar si ya hay una sesion activa (el evento pudo haberse
    //    emitido antes de que este useEffect se montara)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Ya hay sesion → puede ser recovery que ya se proceso
        setSesionRecoveryLista(true)
        setVerificandoEnlace(false)
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
    })

    // 4. Timeout: si en 5s no se establece la sesion, enlace invalido
    timeoutRef.current = setTimeout(() => {
      setEnlaceInvalido(true)
      setServerError('El enlace de recuperación es inválido o ha expirado.')
      setVerificandoEnlace(false)
    }, 5000)

    return () => {
      subscription.unsubscribe()
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const validate = () => {
    const e = {}

    if (!password) {
      e.password = 'La contraseña es obligatoria'
    } else if (password.length < PASSWORD_MIN_LENGTH) {
      e.password = `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
    }

    if (!confirmPassword) {
      e.confirmPassword = 'Debes confirmar la contraseña'
    } else if (password !== confirmPassword) {
      e.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    if (!validate()) return

    try {
      setLoading(true)
      await cambiarContrasena({ newPassword: password })
      toast.success('Contraseña actualizada correctamente.')
      navigate('/login', {
        replace: true,
        state: { mensaje: 'Tu contraseña fue actualizada. Inicia sesión con tu nueva contraseña.' }
      })
    } catch (err) {
      const msg = err?.message || 'No se pudo actualizar la contraseña. Intenta nuevamente.'
      setServerError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Indicador de fuerza de contrasena
  const strengthLabel = () => {
    if (!password) return null
    if (password.length < PASSWORD_MIN_LENGTH) return { text: 'Muy corta', color: 'text-red-600', bar: 'bg-red-400 w-1/4' }
    if (password.length < 8) return { text: 'Débil', color: 'text-orange-600', bar: 'bg-orange-400 w-2/4' }
    if (password.length < 12) return { text: 'Aceptable', color: 'text-yellow-600', bar: 'bg-yellow-400 w-3/4' }
    return { text: 'Fuerte', color: 'text-green-600', bar: 'bg-green-500 w-full' }
  }

  const strength = strengthLabel()

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
              Restablecimiento seguro
            </span>
            <h1 className="font-headline font-extrabold text-white text-5xl xl:text-6xl tracking-tighter leading-tight mb-8">
              Nueva contraseña.
            </h1>
            <p className="text-white/90 text-xl leading-relaxed font-medium">
              Establece una contraseña segura para proteger tu cuenta de FinanzasU.
            </p>
          </div>

          <div className="absolute bottom-12 left-16 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-md">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-headline font-bold text-white text-xl tracking-tighter">FinanzasU</span>
          </div>
        </section>

        {/* ---------- Contenido principal ---------- */}
        <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-24 bg-[#f8f9fa]">
          <div className="w-full max-w-md animate-fade-in">
            {/* Logo movil */}
            <div className="lg:hidden flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-lg editorial-gradient flex items-center justify-center shadow-lg">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="font-headline font-extrabold text-[#24389c] text-2xl tracking-tighter">FinanzasU</span>
            </div>

            {/* Estado: verificando enlace */}
            {verificandoEnlace && (
              <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-[#24389c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#454652] font-medium">Verificando enlace de recuperación...</p>
              </div>
            )}

            {/* Estado: enlace invalido o expirado */}
            {!verificandoEnlace && enlaceInvalido && (
              <>
                <div className="mb-10">
                  <h2 className="font-headline font-extrabold text-4xl tracking-tight mb-3">
                    Enlace no válido
                  </h2>
                  <p className="text-[#454652] font-medium">
                    El enlace de recuperación ha expirado o ya fue utilizado.
                  </p>
                </div>

                {serverError && (
                  <p className="text-red-700 text-sm bg-red-50 px-3 py-2 rounded-lg mb-6">
                    {serverError}
                  </p>
                )}

                <Link
                  to="/forgot-password"
                  className="block w-full py-4 editorial-gradient text-white font-bold rounded-xl shadow-lg hover:opacity-90 active:scale-[0.98] transition-all duration-200 text-lg text-center"
                >
                  Solicitar un nuevo enlace
                </Link>

                <div className="mt-8 text-center">
                  <Link
                    className="inline-flex items-center gap-2 text-[#24389c] font-bold hover:underline"
                    to="/login"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a iniciar sesión
                  </Link>
                </div>
              </>
            )}

            {/* Estado: formulario de nueva contrasena */}
            {!verificandoEnlace && !enlaceInvalido && sesionRecoveryLista && (
              <>
                <div className="mb-10">
                  <h2 className="font-headline font-extrabold text-4xl tracking-tight mb-3">
                    Establece tu nueva contraseña
                  </h2>
                  <p className="text-[#454652] font-medium">
                    Elige una contraseña segura de al menos {PASSWORD_MIN_LENGTH} caracteres.
                  </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  {/* Campo: nueva contrasena */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold ml-1" htmlFor="new-password">
                      Nueva contraseña
                    </label>
                    <div className="login-field-wrap relative group">
                      <span className="login-field-icon text-[#757684]">🔒</span>
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
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

                    {/* Barra de fuerza de contrasena */}
                    {strength && (
                      <div className="space-y-1 mt-1">
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-300 ${strength.bar}`} />
                        </div>
                        <p className={`text-xs font-medium ${strength.color}`}>{strength.text}</p>
                      </div>
                    )}
                  </div>

                  {/* Campo: confirmar contrasena */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold ml-1" htmlFor="confirm-password">
                      Confirmar contraseña
                    </label>
                    <div className="login-field-wrap relative group">
                      <span className="login-field-icon text-[#757684]">🔒</span>
                      <input
                        id="confirm-password"
                        type={showConfirm ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          setErrors((p) => ({ ...p, confirmPassword: undefined }))
                        }}
                        className={`login-input w-full pl-12 pr-12 py-4 border rounded-xl transition-all duration-200 placeholder:text-[#757684]/50 ${
                          errors.confirmPassword ? 'border-red-600' : 'border-[#c5c5d4]/40'
                        }`}
                      />
                      <button
                        className="login-plain-btn login-field-action text-[#757684]"
                        onClick={() => setShowConfirm(!showConfirm)}
                        type="button"
                      >
                        {showConfirm ? '🙈' : '👁️'}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-red-700 ml-1">{errors.confirmPassword}</p>}
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
                    {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </form>

                <div className="mt-12 text-center">
                  <Link
                    className="inline-flex items-center gap-2 text-[#24389c] font-bold hover:underline"
                    to="/login"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a iniciar sesión
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
