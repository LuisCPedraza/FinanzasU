import { supabase } from './supabaseClient'

const DEFAULT_LIMIT = 25

export async function listarNotificaciones(userId, limit = DEFAULT_LIMIT) {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function contarNoLeidas(userId) {
  const { count, error } = await supabase
    .from('notificaciones')
    .select('*', { head: true, count: 'exact' })
    .eq('user_id', userId)
    .eq('leida', false)

  if (error) throw error
  return count ?? 0
}

export async function marcarNotificacionLeida(id, userId) {
  const { data, error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function marcarTodasComoLeidas(userId) {
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('user_id', userId)
    .eq('leida', false)

  if (error) throw error
}

export async function crearNotificacion({
  userId,
  tipo,
  titulo,
  mensaje,
  moduloOrigen,
  rutaDestino = null,
  recursoTipo = null,
  recursoId = null,
  eventKey = null,
  dedupeMinutes = 10
}) {
  if (eventKey) {
    let query = supabase
      .from('notificaciones')
      .select('id, created_at')
      .eq('user_id', userId)
      .eq('event_key', eventKey)
      .order('created_at', { ascending: false })
      .limit(1)

    if (typeof dedupeMinutes === 'number' && dedupeMinutes > 0) {
      const threshold = new Date(Date.now() - dedupeMinutes * 60 * 1000).toISOString()
      query = query.gte('created_at', threshold)
    }

    const { data: duplicated, error: duplicateError } = await query
    if (duplicateError) throw duplicateError
    if ((duplicated ?? []).length > 0) {
      return { skipped: true, data: duplicated[0] }
    }
  }

  const { data, error } = await supabase
    .from('notificaciones')
    .insert({
      user_id: userId,
      tipo,
      titulo,
      mensaje,
      modulo_origen: moduloOrigen,
      ruta_destino: rutaDestino,
      recurso_tipo: recursoTipo,
      recurso_id: recursoId,
      event_key: eventKey
    })
    .select('*')
    .single()

  if (error) throw error
  return { skipped: false, data }
}

export async function registrarEventoLogro({ userId, logroId, nombreLogro }) {
  return crearNotificacion({
    userId,
    tipo: 'logro',
    titulo: 'Logro desbloqueado',
    mensaje: `Felicitaciones, desbloqueaste el logro: ${nombreLogro}`,
    moduloOrigen: 'perfil',
    rutaDestino: '/perfil',
    recursoTipo: 'logro',
    recursoId: String(logroId),
    eventKey: `logro-${logroId}`,
    dedupeMinutes: null
  })
}