import { supabase } from './supabaseClient'

const MAX_SEMESTRES = 10
const SEMESTRES_OPCIONES = Array.from({ length: MAX_SEMESTRES }, (_, i) => i + 1)
const ESTADOS_VALIDOS = ['Activo', 'Pausado', 'Egresado']

export async function obtenerContextoAcademico(userId) {
  const { data, error } = await supabase
    .from('perfiles')
    .select('semestre_actual, total_semestres, meta_grado, estado_academico')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error

  return {
    semestre_actual: data?.semestre_actual || '',
    total_semestres: data?.total_semestres || '',
    meta_grado: data?.meta_grado || '',
    estado_academico: data?.estado_academico || 'Activo'
  }
}

export async function guardarContextoAcademico(userId, { semestre_actual, total_semestres, meta_grado, estado_academico }) {
  const totalSem = Number(total_semestres)
  if (!totalSem || totalSem < 1 || totalSem > MAX_SEMESTRES) {
    throw new Error(`Total de semestres debe ser entre 1 y ${MAX_SEMESTRES}.`)
  }

  const semestreActual = Number(semestre_actual)
  if (!semestreActual || semestreActual < 1 || semestreActual > totalSem) {
    throw new Error(`Semestre actual debe ser entre 1 y ${totalSem}.`)
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
    .update({
      semestre_actual: semestreActual,
      total_semestres: totalSem,
      meta_grado: anio,
      estado_academico
    })
    .eq('id', userId)
    .select('semestre_actual, total_semestres, meta_grado, estado_academico')
    .single()

  if (error) throw error
  return data
}

export { SEMESTRES_OPCIONES, MAX_SEMESTRES, ESTADOS_VALIDOS }