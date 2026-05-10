import { supabase } from './supabaseClient'
import { calcularEstadoPresupuesto } from '../utils/presupuestoStatus'

// ✅ FIX: Helper extraído para reutilizar en getPresupuestos y updatePresupuesto
function enriquecerPresupuesto(p, gastosPorCategoria) {
  const gastado = gastosPorCategoria[p.categoria_id] || 0
  const estadoCalculado = calcularEstadoPresupuesto({
    gastado,
    monto_limite: p.monto_limite,
    umbral_alerta_pct: p.umbral_alerta_pct
  })

  return {
    ...p,
    gastado,
    porcentaje: estadoCalculado.porcentaje,
    estado: estadoCalculado.estado,
    restante: estadoCalculado.restante,
    umbral_alerta_pct: estadoCalculado.umbral_alerta_pct,
  }
}

export async function listarPresupuestos(userId) {
  const { data, error } = await supabase
    .from('presupuestos')
    .select('*, categorias(nombre, icono)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

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

  const gastosPorCategoria = (gastos || []).reduce((acc, g) => {
    acc[g.categoria_id] = (acc[g.categoria_id] || 0) + Number(g.monto)
    return acc
  }, {})

  // ✅ FIX: Usa el helper en lugar de lógica inline
  return presupuestos.map((p) => enriquecerPresupuesto(p, gastosPorCategoria))
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

// ✅ FIX: Recibe mes y anio para recalcular gastado/estado/porcentaje tras actualizar
export async function updatePresupuesto(id, userId, data, mes, anio) {
  const { data: result, error } = await supabase
    .from('presupuestos')
    .update(data)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, categorias(nombre, icono)')
    .single()
  if (error) throw error

  // Recalcular el gasto real de esta categoría en el mes/año
  const { data: gastos } = await supabase
    .from('transacciones')
    .select('categoria_id, monto')
    .eq('user_id', userId)
    .eq('tipo', 'gasto')
    .eq('categoria_id', result.categoria_id)
    .gte('fecha', `${anio}-${String(mes).padStart(2, '0')}-01`)
    .lte('fecha', new Date(anio, mes, 0).toISOString().split('T')[0])

  const gastosPorCategoria = {
    [result.categoria_id]: (gastos || []).reduce((acc, g) => acc + Number(g.monto), 0),
  }

  return enriquecerPresupuesto(result, gastosPorCategoria)
}

export async function deletePresupuesto(id, userId) {
  const { error } = await supabase
    .from('presupuestos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}