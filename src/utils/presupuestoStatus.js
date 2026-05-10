export const DEFAULT_UMBRAL_ALERTA_PCT = 80

export function normalizarUmbralAlertaPct(valor) {
  const numero = Number(valor)

  if (!Number.isFinite(numero)) return DEFAULT_UMBRAL_ALERTA_PCT

  const entero = Math.round(numero)
  if (entero < 1) return 1
  if (entero > 100) return 100

  return entero
}

export function calcularEstadoPresupuesto({ gastado = 0, monto_limite = 0, umbral_alerta_pct = DEFAULT_UMBRAL_ALERTA_PCT }) {
  const limite = Number(monto_limite || 0)
  const gastadoNormalizado = Number(gastado || 0)
  const porcentaje = limite > 0 ? (gastadoNormalizado / limite) * 100 : 0
  const umbral = normalizarUmbralAlertaPct(umbral_alerta_pct)

  let estado = 'verde'
  if (porcentaje >= 100) estado = 'rojo'
  else if (porcentaje >= umbral) estado = 'amarillo'

  return {
    gastado: gastadoNormalizado,
    monto_limite: limite,
    umbral_alerta_pct: umbral,
    porcentaje: Math.round(porcentaje * 10) / 10,
    estado,
    restante: Math.max(0, limite - gastadoNormalizado)
  }
}