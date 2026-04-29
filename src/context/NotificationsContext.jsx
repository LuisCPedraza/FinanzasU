import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuthContext } from './AuthContext'
import {
  contarNoLeidas,
  crearNotificacion,
  listarNotificaciones,
  marcarNotificacionLeida,
  marcarTodasComoLeidas,
  obtenerPreferencias,
  guardarPreferencias
} from '../services/notificacionesService'

const NotificationsContext = createContext(null)

const PREFERENCIAS_DEFAULT = {
  alertas_diarias: true,
  resumen_semanal: true,
  novedades_sistema: false
}

export function NotificationsProvider({ children }) {
  const { usuario } = useAuthContext()
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [cargandoNotificaciones, setCargandoNotificaciones] = useState(false)
  const [errorNotificaciones, setErrorNotificaciones] = useState('')

  // Estado de preferencias
  const [preferencias, setPreferencias] = useState(PREFERENCIAS_DEFAULT)
  const [cargandoPreferencias, setCargandoPreferencias] = useState(false)
  const [errorPreferencias, setErrorPreferencias] = useState('')

  const limpiarNotificaciones = useCallback(() => {
    setNotificaciones([])
    setNoLeidas(0)
    setErrorNotificaciones('')
    setCargandoNotificaciones(false)
    setPreferencias(PREFERENCIAS_DEFAULT)
    setErrorPreferencias('')
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

  // Cargar preferencias desde Supabase
  const cargarPreferencias = useCallback(async () => {
    if (!usuario?.id) return

    setCargandoPreferencias(true)
    setErrorPreferencias('')

    try {
      const data = await obtenerPreferencias(usuario.id)
      setPreferencias(data)
    } catch (error) {
      setErrorPreferencias(error.message || 'No se pudieron cargar las preferencias.')
    } finally {
      setCargandoPreferencias(false)
    }
  }, [usuario?.id])

  // Actualizar un switch y persistir en BD
  const actualizarPreferencia = useCallback(async (campo, valor) => {
    const anteriores = preferencias

    // Optimistic update: actualiza UI inmediatamente
    const nuevas = { ...preferencias, [campo]: valor }
    setPreferencias(nuevas)

    try {
      const guardadas = await guardarPreferencias(usuario.id, nuevas)
      setPreferencias(guardadas)
      return { ok: true }
    } catch (error) {
      // Revertir si falla
      setPreferencias(anteriores)
      return { ok: false, mensaje: error.message || 'No se pudo guardar la preferencia.' }
    }
  }, [preferencias, usuario?.id])

  useEffect(() => {
    cargarNotificaciones()
  }, [cargarNotificaciones])

  useEffect(() => {
    cargarPreferencias()
  }, [cargarPreferencias])

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
    limpiarNotificaciones,
    // Preferencias
    preferencias,
    cargandoPreferencias,
    errorPreferencias,
    cargarPreferencias,
    actualizarPreferencia
  }), [
    notificaciones,
    noLeidas,
    cargandoNotificaciones,
    errorNotificaciones,
    cargarNotificaciones,
    registrarNotificacion,
    marcarLeida,
    marcarTodasLeidas,
    limpiarNotificaciones,
    preferencias,
    cargandoPreferencias,
    errorPreferencias,
    cargarPreferencias,
    actualizarPreferencia
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