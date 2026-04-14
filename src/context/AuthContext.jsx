import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  actualizarPerfilUsuario,
  cambiarContrasenaUsuario,
  cerrarSesionUsuario,
  escucharCambiosAuth,
  iniciarSesionUsuario,
  obtenerSesionActual,
  registrarUsuario
} from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargandoAuth, setCargandoAuth] = useState(true)

  useEffect(() => {
    let mounted = true

    obtenerSesionActual().then(({ data: { session } }) => {
      if (!mounted) return
      setUsuario(session?.user ?? null)
      setCargandoAuth(false)
    })

    const { data: { subscription } } = escucharCambiosAuth(
      (_evento, session) => {
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

  const iniciarSesion = async ({ email, password }) => {
    return iniciarSesionUsuario({ email, password })
  }

  const cerrarSesion = async () => {
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

  const value = useMemo(() => ({
    usuario,
    cargandoAuth,
    registrar,
    iniciarSesion,
    cerrarSesion,
    actualizarPerfil,
    cambiarContrasena
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
