import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuthContext } from './AuthContext'
import {
  contarNoLeidas,
  crearNotificacion,
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasComoLeidas
} from '../services/notificacionesService'

const NotificationsContext = createContext(null)

export function NotificationsProvider({ children }) {
  const { usuario } = useAuthContext()
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(false)
  const [errorNotificaciones, setErrorNotificaciones] = useState('')

  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([])
    setNoLeidas(0)
    setErrorNotificaciones('')
    setCargandoNotificaciones(false)
  }, [])

  const cargarNotificaciones = useCallback(async () => {
    if (!usuario?.id) {
      limpiarNotificaciones()
      return
    }

    setCargandoNotificaciones(true)
    setErrorNotificaciones('')

    try {
      const [data, count] = await Promise.all([
        listarNotificaciones(usuario.id),
        contarNoLeidas(usuario.id)
      ])
      setNotificaciones(data)
      setNoLeidas(count)
    } catch (error) {
      setErrorNotificaciones(error.message || 'No se pudieron cargar las notificaciones.')
    } finally {
      setCargandoNotificaciones(false)
    }
  }, [limpiarNotificaciones, usuario?.id])

  useEffect(() => {
    cargarNotificaciones()
  }, [cargarNotificaciones])

  const registrarNotificacion = useCallback(async (payload) => {
    if (!usuario?.id) return { skipped: true, data: null }

    const result = await crearNotificacion({ ...payload, userId: usuario.id })

    if (!result.skipped && result.data) {
      setNotificaciones((prev) => [result.data, ...prev])
      setNoLeidas((prev) => prev + 1)
    }

    return result
  }, [usuario?.id])

  const marcarLeida = useCallback(async (id) => {
    if (!usuario?.id) return

    const actual = notificaciones.find((n) => n.id === id)
    if (actual?.leida) return

    const actualizada = await marcarNotificacionLeida(id, usuario.id)
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? actualizada : n)))
    setNoLeidas((prev) => Math.max(0, prev - 1))
  }, [usuario?.id, notificaciones])

  const marcarTodasLeidas = useCallback(async () => {
    if (!usuario?.id) return

    await marcarTodasComoLeidas(usuario.id)
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))
    setNoLeidas(0)
  }, [usuario?.id])

  const value = useMemo(() => ({
    notificaciones,
    noLeidas,
    cargandoNotificaciones,
    errorNotificaciones,
    cargarNotificaciones,
    registrarNotificacion,
    marcarLeida,
    marcarTodasLeidas,
    limpiarNotificaciones
  }), [
    notificaciones,
    noLeidas,
    cargandoNotificaciones,
    errorNotificaciones,
    cargarNotificaciones,
    registrarNotificacion,
    marcarLeida,
    marcarTodasLeidas,
    limpiarNotificaciones
  ])

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotificationsContext() {
  const context = useContext(NotificationsContext)
  if (!context) {
    throw new Error('useNotificationsContext debe usarse dentro de NotificationsProvider')
  }
  return context
}