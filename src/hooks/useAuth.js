import { useAuthContext } from '../context/AuthContext'

/**
 * Hook publico para acceder a las funciones de autenticacion.
 * Incluye: login, registro, logout, perfil, contrasena y recuperacion.
 */
export function useAuth() {
  const {
    usuario,
    cargandoAuth,
    registrar,
    iniciarSesion,
    cerrarSesion,
    actualizarPerfil,
    cambiarContrasena,
    solicitarRecuperacion
  } = useAuthContext()

  return {
    usuario,
    cargando: cargandoAuth,
    registrar,
    iniciarSesion,
    cerrarSesion,
    actualizarPerfil,
    cambiarContrasena,
    solicitarRecuperacion
  }
}