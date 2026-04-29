/**
 * Motor de evaluación de logros.
 * Funciones puras que reciben datos financieros y retornan avance numérico.
 * NO hace queries a la BD — solo opera sobre datos ya cargados en memoria.
 */

// ─── Helpers ────────────────────────────────────────────────

function contarPorTipo(transacciones, tipo) {
  return transacciones.filter((t) => t.tipo === tipo).length
}

function sumarPorTipo(transacciones, tipo) {
  return transacciones
    .filter((t) => t.tipo === tipo)
    .reduce((acc, t) => acc + Number(t.monto || 0), 0)
}

function categoriasUnicasPorTipo(transacciones, tipo) {
  const ids = new Set()
  transacciones.forEach((t) => {
    if (t.tipo === tipo && t.categoria_id) ids.add(Number(t.categoria_id))
  })
  return ids.size
}

function getPeriodo(fecha) {
  const [anioTxt, mesTxt] = String(fecha || '').split('-')
  return { anio: Number(anioTxt), mes: Number(mesTxt) }
}

function agruparPresupuestosPorPeriodo(presupuestos) {
  const map = new Map()
  presupuestos.forEach((p) => {
    const key = `${p.mes}-${p.anio}`
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(p)
  })
  return map
}

function gastosPorCategoriaPeriodo(transacciones, mes, anio) {
  const map = {}
  transacciones.forEach((t) => {
    if (t.tipo !== 'gasto') return
    const periodo = getPeriodo(t.fecha)
    if (periodo.mes === mes && periodo.anio === anio) {
      const catId = Number(t.categoria_id)
      map[catId] = (map[catId] || 0) + Number(t.monto || 0)
    }
  })
  return map
}

// ─── Reglas de Evaluación ───────────────────────────────────

const REGLAS = {
  'el-gaston': ({ transacciones }) => contarPorTipo(transacciones, 'gasto') >= 1 ? 1 : 0,
  'comprador-serial': ({ transacciones }) => contarPorTipo(transacciones, 'gasto'),
  'billetera-rota': ({ transacciones }) => contarPorTipo(transacciones, 'gasto'),
  'gasto-hormiga-hunter': ({ transacciones }) =>
    transacciones.filter((t) => t.tipo === 'gasto' && Number(t.monto) < 5000).length,
  'big-spender': ({ transacciones }) =>
    transacciones.some((t) => t.tipo === 'gasto' && Number(t.monto) > 500000) ? 1 : 0,

  'primer-ingreso': ({ transacciones }) => contarPorTipo(transacciones, 'ingreso') >= 1 ? 1 : 0,
  'ahorrativo': ({ transacciones }) => {
    const balancePositivo = sumarPorTipo(transacciones, 'ingreso') > sumarPorTipo(transacciones, 'gasto')
    return balancePositivo ? transacciones.length : 0
  },
  'colchon-financiero': ({ transacciones }) => {
    const balance = sumarPorTipo(transacciones, 'ingreso') - sumarPorTipo(transacciones, 'gasto')
    return balance > 1000000 ? 1 : 0
  },
  'ingresos-estables': ({ transacciones }) => contarPorTipo(transacciones, 'ingreso'),
  'millonario-estudiantil': ({ transacciones }) =>
    sumarPorTipo(transacciones, 'ingreso') >= 5000000 ? 1 : 0,

  'primer-presupuesto': ({ presupuestos }) => presupuestos.length >= 1 ? 1 : 0,
  'planificador': ({ presupuestos }) => new Set(presupuestos.map((p) => Number(p.categoria_id))).size,
  'guardian-del-limite': ({ transacciones, presupuestos }) => {
    const periodos = agruparPresupuestosPorPeriodo(presupuestos)
    for (const [, pp] of periodos) {
      const gastos = gastosPorCategoriaPeriodo(transacciones, pp[0].mes, pp[0].anio)
      if (pp.length > 0 && pp.every((p) => (gastos[Number(p.categoria_id)] || 0) <= Number(p.monto_limite))) return 1
    }
    return 0
  },
  'presupuesto-perfecto': ({ transacciones, presupuestos }) => {
    for (const p of presupuestos) {
      const gastos = gastosPorCategoriaPeriodo(transacciones, p.mes, p.anio)
      const limite = Number(p.monto_limite)
      if (limite <= 0) continue
      const pct = ((gastos[Number(p.categoria_id)] || 0) / limite) * 100
      if (pct >= 80 && pct <= 100) return 1
    }
    return 0
  },
  'multi-presupuesto': ({ presupuestos }) => {
    const conteo = {}
    presupuestos.forEach((p) => { conteo[`${p.mes}-${p.anio}`] = (conteo[`${p.mes}-${p.anio}`] || 0) + 1 })
    return Math.max(0, ...Object.values(conteo))
  },

  'primera-transaccion': ({ transacciones }) => transacciones.length >= 1 ? 1 : 0,
  'registro-diligente': ({ transacciones }) => transacciones.length,
  'centurion': ({ transacciones }) => transacciones.length,
  'organizador-nato': ({ transacciones }) => categoriasUnicasPorTipo(transacciones, 'gasto'),
  'diversificador': ({ transacciones }) => categoriasUnicasPorTipo(transacciones, 'ingreso'),

  'sensei-financiero': ({ progresoPrevio }) =>
    (progresoPrevio || []).filter((p) => p.desbloqueado && p.logro_id !== 'sensei-financiero').length,
  'equilibrista': ({ transacciones }) => {
    const ingresos = sumarPorTipo(transacciones, 'ingreso')
    const gastos = sumarPorTipo(transacciones, 'gasto')
    if (transacciones.length < 20 || ingresos === 0) return 0
    return (gastos / ingresos) * 100 <= 60 ? 1 : 0
  },
  'master-categorias': ({ categorias }) =>
    categorias.filter((c) => c.user_id && !c.es_predeterminada).length,

  'madrugador': ({ transacciones }) =>
    transacciones.some((t) => t.created_at && new Date(t.created_at).getHours() < 7) ? 1 : 0,
  'noctambulo': ({ transacciones }) =>
    transacciones.some((t) => t.created_at && new Date(t.created_at).getHours() >= 23) ? 1 : 0
}

// ─── Función Principal ──────────────────────────────────────

/**
 * Evalúa TODOS los logros activos y retorna el avance de cada uno.
 *
 * @param {Object} params
 * @param {Array} params.transacciones
 * @param {Array} params.presupuestos
 * @param {Array} params.categorias
 * @param {Array} params.catalogoLogros - Catálogo completo de logros activos
 * @param {Array} params.progresoPrevio - Progreso actual del usuario
 * @returns {Array<{logroId, nombre, icono, avanceNuevo, meta, recienDesbloqueado, cambio}>}
 */
export function evaluarLogros({ transacciones = [], presupuestos = [], categorias = [], catalogoLogros = [], progresoPrevio = [] }) {
  const datos = { transacciones, presupuestos, categorias, progresoPrevio }

  const progresoMap = {}
  progresoPrevio.forEach((p) => { progresoMap[p.logro_id] = p })

  const resultados = []

  for (const logro of catalogoLogros) {
    const regla = REGLAS[logro.id]
    if (!regla) continue

    const avanceNuevo = Math.max(0, regla(datos))
    const previo = progresoMap[logro.id]
    const avancePrevio = previo?.avance_actual ?? 0
    const yaDesbloqueado = previo?.desbloqueado === true
    const ahoraDesbloqueado = avanceNuevo >= logro.meta
    const cambio = avanceNuevo !== avancePrevio

    resultados.push({
      logroId: logro.id,
      nombre: logro.nombre,
      icono: logro.icono,
      avanceNuevo,
      meta: logro.meta,
      recienDesbloqueado: ahoraDesbloqueado && !yaDesbloqueado,
      cambio
    })
  }

  return resultados
}
