import { useLogrosContext } from '../context/LogrosContext'

/**
 * Hook conveniente para consumir el sistema de logros.
 *
 * Expone:
 * - catalogoLogros: lista de todos los logros activos
 * - progreso: progreso del usuario con datos del catálogo
 * - estadisticas: { totalLogros, desbloqueados, bloqueados, porcentajeGeneral }
 * - cargandoLogros: boolean de carga
 * - errorLogros: mensaje de error si hubo
 * - evaluarLogros: trigger manual de evaluación
 * - cargarLogros: recargar desde Supabase
 */
export default function useLogros() {
  const {
    catalogoLogros,
    progreso,
    estadisticas,
    cargandoLogros,
    errorLogros,
    evaluarYActualizarLogros,
    cargarLogros
  } = useLogrosContext()

  return {
    catalogoLogros,
    progreso,
    estadisticas,
    cargandoLogros,
    errorLogros,
    evaluarLogros: evaluarYActualizarLogros,
    cargarLogros
  }
}
