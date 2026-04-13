import { supabase } from './supabaseClient'

export async function getPresupuestos(userId, mes, anio) {
  const { data: presupuestos, error: pError } = await supabase
    .from('presupuestos')
    .select('*, categorias(nombre, icono)')
    .eq('user_id', userId)
    .eq('mes', mes)
    .eq('anio', anio)
    .order('created_at')

  if (pError) throw pError
  if (!presupuestos || presupuestos.length === 0) return []

  const { data: gastos, error: gError } = await supabase
    .from('transacciones')
    .select('categoria_id, monto')
    .eq('user_id', userId)
    .eq('tipo', 'gasto')
    .gte('fecha', `${anio}-${String(mes).padStart(2, '0')}-01`)
    .lte('fecha', new Date(anio, mes, 0).toISOString().split('T')[0])

  if (gError) throw gError

  const gastosPorCategoria = (gastos || []).reduce(
    (acc, g) => {
      acc[g.categoria_id] = (acc[g.categoria_id] || 0) + Number(g.monto)
      return acc
    },
    {}
  )

  return (presupuestos || []).map((p) => {
    const gastado = gastosPorCategoria[p.categoria_id] || 0
    const porcentaje = p.monto_limite > 0 ? (gastado / Number(p.monto_limite)) * 100 : 0
    let estado = 'verde'
    if (porcentaje >= 100) estado = 'rojo'
    else if (porcentaje >= 80) estado = 'amarillo'

    return {
      ...p,
      gastado,
      porcentaje: Math.round(porcentaje * 10) / 10,
      estado,
      restante: Math.max(0, Number(p.monto_limite) - gastado),
    }
  })
}

export async function createPresupuesto(data) {
  const { data: result, error } = await supabase
    .from('presupuestos')
    .insert(data)
    .select('*, categorias(nombre, icono)')
    .single()
  if (error) throw error
  return result
}

export async function updatePresupuesto(id, userId, data) {
  const { data: result, error } = await supabase
    .from('presupuestos')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, categorias(nombre, icono)')
    .single()
  if (error) throw error
  return result
}

export async function deletePresupuesto(id, userId) {
  const { error } = await supabase
    .from('presupuestos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}