import { supabase } from './supabaseClient'

export async function listarPresupuestos(userId) {
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
