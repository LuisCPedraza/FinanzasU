import { supabase } from './supabaseClient'

/**
 * Obtiene todos los logros activos del catálogo global.
 */
export async function obtenerCatalogoLogros() {
  const { data, error } = await supabase
    .from('catalogo_logros')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (error) throw error
  return data ?? []
}

/**
 * Obtiene el progreso de logros del usuario con datos del catálogo unidos.
 */
export async function obtenerProgresoUsuario(userId) {
  const { data, error } = await supabase
    .from('progreso_logros')
    .select('*, catalogo_logros(*)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Inserta o actualiza el progreso de un logro para el usuario.
 * Si avance >= meta, marca como desbloqueado con fecha.
 * Retorna el registro actualizado y si fue recién desbloqueado.
 */
export async function upsertProgresoLogro(userId, logroId, avance, meta) {
  const porcentaje = meta > 0 ? Math.min(100, Math.round((avance / meta) * 1000) / 10) : 0
  const desbloqueado = avance >= meta

  // Verificar si ya estaba desbloqueado para no sobreescribir fecha_desbloqueo
  const { data: existente } = await supabase
    .from('progreso_logros')
    .select('id, desbloqueado, avance_actual')
    .eq('user_id', userId)
    .eq('logro_id', logroId)
    .maybeSingle()

  // Si ya está desbloqueado y el avance no cambió, no hacer nada
  if (existente?.desbloqueado && existente?.avance_actual === avance) {
    return { data: existente, recienDesbloqueado: false }
  }

  const yaEstabaDesbloqueado = existente?.desbloqueado === true
  const recienDesbloqueado = desbloqueado && !yaEstabaDesbloqueado

  const payload = {
    user_id: userId,
    logro_id: logroId,
    avance_actual: avance,
    porcentaje,
    desbloqueado,
    updated_at: new Date().toISOString()
  }

  // Solo asignar fecha_desbloqueo si es un nuevo desbloqueo
  if (recienDesbloqueado) {
    payload.fecha_desbloqueo = new Date().toISOString()
  }

  let result

  if (existente) {
    // Actualizar registro existente
    const { data, error } = await supabase
      .from('progreso_logros')
      .update(payload)
      .eq('id', existente.id)
      .select('*')
      .single()

    if (error) throw error
    result = data
  } else {
    // Insertar nuevo registro
    if (recienDesbloqueado) {
      payload.fecha_desbloqueo = new Date().toISOString()
    }
    const { data, error } = await supabase
      .from('progreso_logros')
      .insert(payload)
      .select('*')
      .single()

    if (error) throw error
    result = data
  }

  return { data: result, recienDesbloqueado }
}

/**
 * Obtiene solo los logros desbloqueados del usuario.
 */
export async function obtenerLogrosDesbloqueados(userId) {
  const { data, error } = await supabase
    .from('progreso_logros')
    .select('*, catalogo_logros(*)')
    .eq('user_id', userId)
    .eq('desbloqueado', true)
    .order('fecha_desbloqueo', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Obtiene estadísticas generales de logros del usuario.
 */
export async function obtenerEstadisticasLogros(userId) {
  const [catalogoRes, progresoRes] = await Promise.all([
    supabase.from('catalogo_logros').select('id', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('progreso_logros').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('desbloqueado', true)
  ])

  if (catalogoRes.error) throw catalogoRes.error
  if (progresoRes.error) throw progresoRes.error

  const totalLogros = catalogoRes.count ?? 0
  const desbloqueados = progresoRes.count ?? 0
  const porcentajeGeneral = totalLogros > 0 ? Math.round((desbloqueados / totalLogros) * 100) : 0

  return {
    totalLogros,
    desbloqueados,
    bloqueados: totalLogros - desbloqueados,
    porcentajeGeneral
  }
}
