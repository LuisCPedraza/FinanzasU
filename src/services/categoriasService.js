import { supabase } from './supabaseClient'

export async function listarCategorias(userId) {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .or(`user_id.eq.${userId},user_id.is.null`)
    .order('es_predeterminada', { ascending: false })
    .order('nombre', { ascending: true })

  if (error) throw error
  return data ?? []
}
