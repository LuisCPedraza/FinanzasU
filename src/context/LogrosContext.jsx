import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuthContext } from './AuthContext'
import { useNotificationsContext } from './NotificationsContext'
import { obtenerCatalogoLogros, obtenerProgresoUsuario, upsertProgresoLogro, obtenerEstadisticasLogros } from '../services/logrosService'
import { registrarEventoLogro } from '../services/notificacionesService'
import { evaluarLogros } from '../services/logrosEngine'

const LogrosContext = createContext(null)

export function LogrosProvider({ children }) {
  const { usuario } = useAuthContext()
  const { cargarNotificaciones } = useNotificationsContext()

  const [catalogoLogros, setCatalogoLogros] = useState([])
  const [progreso, setProgreso] = useState([])
  const [estadisticas, setEstadisticas] = useState({ totalLogros: 0, desbloqueados: 0, bloqueados: 0, porcentajeGeneral: 0 })
  const [cargandoLogros, setCargandoLogros] = useState(false)
  const [errorLogros, setErrorLogros] = useState('')

  const limpiarLogros = useCallback(() => {
    setCatalogoLogros([])
    setProgreso([])
    setEstadisticas({ totalLogros: 0, desbloqueados: 0, bloqueados: 0, porcentajeGeneral: 0 })
    setErrorLogros('')
    setCargandoLogros(false)
  }, [])

  // Carga inicial: catálogo + progreso del usuario
  const cargarLogros = useCallback(async () => {
    if (!usuario?.id) {
      limpiarLogros()
      return
    }

    setCargandoLogros(true)
    setErrorLogros('')

    try {
      const [catalogo, progresoData, stats] = await Promise.all([
        obtenerCatalogoLogros(),
        obtenerProgresoUsuario(usuario.id),
        obtenerEstadisticasLogros(usuario.id)
      ])

      setCatalogoLogros(catalogo)
      setProgreso(progresoData)
      setEstadisticas(stats)
    } catch (error) {
      console.error('Error cargando logros:', error)
      setErrorLogros(error.message || 'No se pudieron cargar los logros.')
    } finally {
      setCargandoLogros(false)
    }
  }, [limpiarLogros, usuario?.id])

  useEffect(() => {
    cargarLogros()
  }, [cargarLogros])

  /**
   * Evalúa todos los logros con los datos actuales y persiste cambios.
   * Se llama desde AppDataContext después de crear/editar/eliminar transacciones.
   */
  const evaluarYActualizarLogros = useCallback(async ({ transacciones, presupuestos, categorias }) => {
    if (!usuario?.id || catalogoLogros.length === 0) return

    try {
      const resultados = evaluarLogros({
        transacciones,
        presupuestos,
        categorias,
        catalogoLogros,
        progresoPrevio: progreso
      })

      // Filtrar solo los que tuvieron cambio en avance
      const conCambio = resultados.filter((r) => r.cambio)

      if (conCambio.length === 0) return

      // Persistir cambios en paralelo
      const upsertPromises = conCambio.map((r) =>
        upsertProgresoLogro(usuario.id, r.logroId, r.avanceNuevo, r.meta)
      )

      const upsertResults = await Promise.all(upsertPromises)

      // Enviar notificaciones para logros recién desbloqueados
      const recienDesbloqueados = conCambio.filter((r) => r.recienDesbloqueado)

      for (const logro of recienDesbloqueados) {
        try {
          await registrarEventoLogro({
            userId: usuario.id,
            logroId: logro.logroId,
            nombreLogro: `${logro.icono} ${logro.nombre}`
          })
        } catch (notifError) {
          console.warn('No se pudo notificar logro:', logro.logroId, notifError)
        }
      }

      // Recargar datos de progreso para mantener estado sincronizado
      const [progresoActualizado, statsActualizadas] = await Promise.all([
        obtenerProgresoUsuario(usuario.id),
        obtenerEstadisticasLogros(usuario.id)
      ])

      setProgreso(progresoActualizado)
      setEstadisticas(statsActualizadas)

      // Recargar notificaciones si hubo desbloqueos
      if (recienDesbloqueados.length > 0) {
        await cargarNotificaciones()
      }
    } catch (error) {
      console.error('Error evaluando logros:', error)
    }
  }, [usuario?.id, catalogoLogros, progreso, cargarNotificaciones])

  const value = useMemo(() => ({
    catalogoLogros,
    progreso,
    estadisticas,
    cargandoLogros,
    errorLogros,
    cargarLogros,
    evaluarYActualizarLogros,
    limpiarLogros
  }), [
    catalogoLogros,
    progreso,
    estadisticas,
    cargandoLogros,
    errorLogros,
    cargarLogros,
    evaluarYActualizarLogros,
    limpiarLogros
  ])

  return <LogrosContext.Provider value={value}>{children}</LogrosContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLogrosContext() {
  const context = useContext(LogrosContext)
  if (!context) {
    throw new Error('useLogrosContext debe usarse dentro de LogrosProvider')
  }
  return context
}
