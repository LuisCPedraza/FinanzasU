import { useNotificationsContext } from '../context/NotificationsContext'

export function useNotificaciones() {
  const {
    notificaciones,
    noLeidas,
    cargandoNotificaciones,
    errorNotificaciones,
    cargarNotificaciones,
    registrarNotificacion,
    marcarLeida,
    marcarTodasLeidas,
    limpiarNotificaciones
  } = useNotificationsContext()

  return {
    notificaciones,
    noLeidas,
    cargando: cargandoNotificaciones,
    error: errorNotificaciones,
    cargarNotificaciones,
    registrarNotificacion,
    marcarLeida,
    marcarTodasLeidas,
    limpiarNotificaciones
  }
}