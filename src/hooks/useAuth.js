import { useAuthContext } from '../context/AuthContext'

export function useAuth() {
  const {
    usuario,
    cargandoAuth,
    registrar,
    iniciarSesion,
    cerrarSesion,
    actualizarPerfil,
    cambiarContrasena
  } = useAuthContext()

  return {
    usuario,
    cargando: cargandoAuth,
    registrar,
    iniciarSesion,
    cerrarSesion,
    actualizarPerfil,
    cambiarContrasena
  }
}