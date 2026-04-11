import { supabase } from './supabaseClient'

export async function listarTransacciones(userId) {
  const { data, error } = await supabase
    .from('transacciones')
    .select('*')
    .eq('user_id', userId)
    .order('fecha', { ascending: false })
    .order('id', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function crearTransaccion(payload) {
  const { data, error } = await supabase
    .from('transacciones')
    .insert(payload)
    .select('*')
    .single()

  if (error) throw error
  return data
}
