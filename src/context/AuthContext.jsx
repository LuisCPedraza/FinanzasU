import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  actualizarPerfilUsuario,
  cambiarContrasenaUsuario,
  cerrarSesionUsuario,
  escucharCambiosAuth,
  iniciarSesionUsuario,
  obtenerSesionActual,
  registrarUsuario,
  solicitarRecuperacionContrasena
} from '../services/authService'

const AuthContext = createContext(null)

/**
 * Clave utilizada en localStorage / sessionStorage para determinar
 * si la sesion debe persistir al cerrar el navegador ("Recordarme").
 *
 * - localStorage  → sesion persistente (sobrevive cierre de navegador)
 * - sessionStorage → sesion temporal  (se pierde al cerrar pestana)
 *
 * Si no existe en ninguno de los dos storages al cargar la app,
 * se cierra la sesion automaticamente para forzar re-autenticacion.
 */
const SESSION_KEY = 'finanzasu_session'

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargandoAuth, setCargandoAuth] = useState(true)

  /**
   * Detecta si la URL actual corresponde al flujo de recuperacion
   * de contrasena. En ese caso NO se debe aplicar la limpieza
   * de sesion "Recordarme", porque Supabase establece una sesion
   * temporal de tipo PASSWORD_RECOVERY que necesitamos conservar.
   */
  const esFlujodeRecuperacion = () => {
    const path = window.location.pathname
    const hash = window.location.hash
    return (
      path === '/reset-password' ||
      hash.includes('type=recovery') ||
      hash.includes('access_token')
    )
  }

  useEffect(() => {
    let mounted = true

    obtenerSesionActual().then(({ data: { session } }) => {
      if (!mounted) return

      // --- Logica "Recordarme" ---
      // Si Supabase tiene una sesion activa pero NO existe el flag
      // en localStorage ni sessionStorage, significa que el usuario
      // NO marco "Recordarme" y ya cerro el navegador previamente.
      // En ese caso cerramos sesion para no mantener acceso no deseado.
      //
      // EXCEPCION: si estamos en el flujo de recuperacion de contrasena,
      // NO cerramos la sesion porque Supabase la acaba de crear
      // a partir del enlace de recovery y la necesitamos para
      // poder llamar a updateUser({ password }).
      if (session?.user) {
        const enLocal = localStorage.getItem(SESSION_KEY)
        const enSession = sessionStorage.getItem(SESSION_KEY)

        if (!enLocal && !enSession && !esFlujodeRecuperacion()) {
          cerrarSesionUsuario().then(() => {
            if (mounted) {
              setUsuario(null)
              setCargandoAuth(false)
            }
          })
          return
        }
      }

      setUsuario(session?.user ?? null)
      setCargandoAuth(false)
    })

    const { data: { subscription } } = escucharCambiosAuth(
      (evento, session) => {
        // Cuando Supabase procesa un enlace de recuperacion, emite
        // el evento PASSWORD_RECOVERY. Guardamos un flag temporal
        // en sessionStorage para que la logica de "Recordarme"
        // no destruya esta sesion antes de que el usuario pueda
        // cambiar su contrasena.
        if (evento === 'PASSWORD_RECOVERY' && session?.user) {
          sessionStorage.setItem(SESSION_KEY, 'recovery')
        }

        setUsuario(session?.user ?? null)
        setCargandoAuth(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const registrar = async ({ nombre, email, password }) => {
    return registrarUsuario({ nombre, email, password })
  }

  /**
   * Inicia sesion con email/password.
   *
   * @param {Object} params
   * @param {string} params.email
   * @param {string} params.password
   * @param {boolean} [params.recordar=false] - Si true, la sesion
   *   persiste en localStorage; si false, solo en sessionStorage
   *   (se pierde al cerrar el navegador).
   */
  const iniciarSesion = async ({ email, password, recordar = false }) => {
    const data = await iniciarSesionUsuario({ email, password })

    if (recordar) {
      localStorage.setItem(SESSION_KEY, 'persistent')
      sessionStorage.removeItem(SESSION_KEY)
    } else {
      sessionStorage.setItem(SESSION_KEY, 'temporary')
      localStorage.removeItem(SESSION_KEY)
    }

    return data
  }

  /**
   * Cierra sesion y limpia ambos storages para que no quede
   * ningun rastro del flag de "Recordarme".
   */
  const cerrarSesion = async () => {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    await cerrarSesionUsuario()
  }

  const actualizarPerfil = async ({ nombre, email }) => {
    const data = await actualizarPerfilUsuario({ nombre, email })
    if (data?.user) {
      setUsuario(data.user)
    }
    return data
  }

  const cambiarContrasena = async ({ newPassword }) => {
    const data = await cambiarContrasenaUsuario({ newPassword })
    if (data?.user) {
      setUsuario(data.user)
    }
    return data
  }

  /**
   * Solicita recuperacion de contrasena por correo.
   * Delega al servicio que devuelve un mensaje neutral.
   */
  const solicitarRecuperacion = async ({ email }) => {
    return solicitarRecuperacionContrasena({ email })
  }

  const value = useMemo(() => ({
    usuario,
    cargandoAuth,
    registrar,
    iniciarSesion,
    cerrarSesion,
    actualizarPerfil,
    cambiarContrasena,
    solicitarRecuperacion
  }), [usuario, cargandoAuth])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de AuthProvider')
  }
  return context
}
