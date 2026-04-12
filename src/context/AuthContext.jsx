import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
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

  const value = useMemo(() => ({
    usuario,
    cargandoAuth,
    registrar,
    iniciarSesion,
    cerrarSesion
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
