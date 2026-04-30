import { supabase } from './supabaseClient'

const SEMESTRES_VALIDOS = ['Inicial', 'Básico', 'Intermedio', 'Avanzado', 'Final']
const ESTADOS_VALIDOS = ['Activo', 'Pausado', 'Egresado']

export async function obtenerContextoAcademico(userId) {
  const { data, error } = await supabase
    .from('perfiles')
    .select('semestre_actual, meta_grado, estado_academico')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  return {
    semestre_actual: data?.semestre_actual || '',
    meta_grado: data?.meta_grado || '',
    estado_academico: data?.estado_academico || 'Activo'
  }
}

export async function guardarContextoAcademico(userId, { semestre_actual, meta_grado, estado_academico }) {
  // Validaciones
  if (!semestre_actual || !SEMESTRES_VALIDOS.includes(semestre_actual)) {
    throw new Error('Semestre actual no válido.')
  }

  const anio = Number(meta_grado)
  if (!anio || anio < 2024 || anio > 2040) {
    throw new Error('Meta de grado debe ser un año válido entre 2024 y 2040.')
  }

  if (!estado_academico || !ESTADOS_VALIDOS.includes(estado_academico)) {
    throw new Error('Estado académico no válido.')
  }

  const { data, error } = await supabase
    .from('perfiles')
    .upsert(
      {
        id: userId,
        semestre_actual,
        meta_grado: anio,
        estado_academico
      },
      { onConflict: 'id' }
    )
    .select('semestre_actual, meta_grado, estado_academico')
    .single()

  if (error) throw error
  return data
}

export { SEMESTRES_VALIDOS, ESTADOS_VALIDOS }