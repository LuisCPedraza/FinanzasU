/**
 * seed-transacciones.js
 *
 * Genera ~75 transacciones de prueba asociadas a tu usuario para testear paginación.
 * Todas las descripciones llevan el prefijo [SEED] para poder borrarlas fácilmente.
 *
 * Uso:
 *   node scripts/seed-transacciones.js <email> <password>          → inserta registros
 *   node scripts/seed-transacciones.js <email> <password> --clean  → elimina registros de prueba
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ─── Leer variables de entorno ───────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dir, '..')

function leerEnv() {
  for (const nombre of ['.env.local', '.env']) {
    const ruta = resolve(ROOT, nombre)
    if (!existsSync(ruta)) continue
    console.log(`   Leyendo variables desde: ${ruta}`)
    const vars = {}
    const lineas = readFileSync(ruta, 'utf8').split(/\r?\n/) // soporta \r\n (Windows) y \n
    for (const linea of lineas) {
      const match = linea.match(/^\s*([^#=\s][^=]*?)\s*=\s*(.+?)\s*$/)
      if (match) vars[match[1].trim()] = match[2].replace(/^['"]|['"]$/g, '')
    }
    return vars
  }
  console.warn('   Archivos .env.local y .env no encontrados en:', ROOT)
  return {}
}

const env = leerEnv()
const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌  No se encontraron VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY en .env.local')
  process.exit(1)
}

// ─── Argumentos CLI ──────────────────────────────────────────────────────────
const [, , email, password, flag] = process.argv
const MODO_CLEAN = flag === '--clean'

if (!email || !password) {
  console.error('❌  Uso: node scripts/seed-transacciones.js <email> <password> [--clean]')
  process.exit(1)
}

// ─── Datos de prueba ─────────────────────────────────────────────────────────
const SEED_TAG = '[SEED]'

/** 75 entradas: 25 por mes, mezclando ingresos y gastos */
function generarTransacciones(userId, categorias) {
  const catIngreso = categorias.filter((c) => c.tipo === 'ingreso')
  const catGasto = categorias.filter((c) => c.tipo === 'gasto')

  if (catIngreso.length === 0 || catGasto.length === 0) {
    throw new Error('El usuario no tiene categorías de ingreso y gasto. Asegúrate de tener al menos una de cada tipo.')
  }

  const rand = (min, max) => Math.round((Math.random() * (max - min) + min) * 100) / 100
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
  const pad = (n) => String(n).padStart(2, '0')

  const descripciones = {
    ingreso: ['Mesada mensual', 'Pago trabajo freelance', 'Transferencia recibida', 'Beca universitaria', 'Premio sorteo', 'Devolución impuestos'],
    gasto: ['Almuerzo campus', 'Pasaje bus', 'Materiales clase', 'Suscripción streaming', 'Farmacia', 'Supermercado', 'Recarga celular', 'Café', 'Fotocopias', 'Práctica deporte']
  }

  const registros = []

  // 3 meses × 25 registros = 75
  const meses = [
    { anio: 2026, mes: 2 },
    { anio: 2026, mes: 3 },
    { anio: 2026, mes: 4 }
  ]

  for (const { anio, mes } of meses) {
    const diasEnMes = new Date(anio, mes, 0).getDate()
    for (let i = 0; i < 25; i++) {
      const esIngreso = i % 5 === 0 // ~20% ingresos, 80% gastos
      const tipo = esIngreso ? 'ingreso' : 'gasto'
      const cat = esIngreso ? pick(catIngreso) : pick(catGasto)
      const dia = pad(Math.floor(Math.random() * diasEnMes) + 1)
      const desc = `${SEED_TAG} ${pick(descripciones[tipo])}`
      const monto = esIngreso ? rand(50_000, 800_000) : rand(1_000, 120_000)

      registros.push({
        user_id: userId,
        tipo,
        monto,
        descripcion: desc,
        categoria_id: cat.id,
        fecha: `${anio}-${pad(mes)}-${dia}`
      })
    }
  }

  return registros
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function main() {
  // 1. Autenticar
  console.log(`🔐  Autenticando como ${email}...`)
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })
  if (authError) {
    console.error('❌  Error de autenticación:', authError.message)
    process.exit(1)
  }

  const userId = authData.user.id
  console.log(`✅  Sesión iniciada. user_id: ${userId}`)

  // 2. Modo clean
  if (MODO_CLEAN) {
    console.log(`\n🗑️   Eliminando transacciones de prueba (descripción contiene "${SEED_TAG}")...`)
    const { error, count } = await supabase
      .from('transacciones')
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .like('descripcion', `${SEED_TAG}%`)

    if (error) {
      console.error('❌  Error al eliminar:', error.message)
      process.exit(1)
    }
    console.log(`✅  ${count ?? '?'} transacciones eliminadas.`)
    return
  }

  // 3. Obtener categorías del usuario (predeterminadas + propias)
  console.log('\n📂  Obteniendo categorías...')
  const { data: categorias, error: catError } = await supabase
    .from('categorias')
    .select('id, nombre, tipo')
    .or(`user_id.eq.${userId},es_predeterminada.eq.true`)

  if (catError || !categorias?.length) {
    console.error('❌  No se pudieron obtener categorías:', catError?.message ?? 'sin datos')
    process.exit(1)
  }
  console.log(`   ${categorias.length} categorías encontradas.`)

  // 4. Generar y verificar que no haya seed previo
  const { count: yaExisten } = await supabase
    .from('transacciones')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .like('descripcion', `${SEED_TAG}%`)

  if (yaExisten > 0) {
    console.warn(`⚠️   Ya existen ${yaExisten} registros de prueba. Ejecuta con --clean primero o ignora esto.`)
  }

  // 5. Insertar en lotes de 25
  const registros = generarTransacciones(userId, categorias)
  console.log(`\n📥  Insertando ${registros.length} transacciones de prueba...`)

  const LOTE = 25
  let insertados = 0
  for (let i = 0; i < registros.length; i += LOTE) {
    const lote = registros.slice(i, i + LOTE)
    const { error: insertError } = await supabase.from('transacciones').insert(lote)
    if (insertError) {
      console.error(`❌  Error en lote ${i / LOTE + 1}:`, insertError.message)
      process.exit(1)
    }
    insertados += lote.length
    console.log(`   ✓ ${insertados}/${registros.length} insertadas`)
  }

  console.log('\n🎉  Seed completado.')
  console.log(`   Para eliminar estos registros ejecuta:`)
  console.log(`   node scripts/seed-transacciones.js ${email} <password> --clean\n`)
}

main().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
