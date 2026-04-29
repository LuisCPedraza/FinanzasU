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

export async function crearCategoria(payload) {
  const { data, error } = await supabase
    .from('categorias')
    .insert(payload)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function actualizarCategoria(id, userId, updates) {
  const { data, error } = await supabase
    .from('categorias')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function eliminarCategoria(id, userId) {
  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}
