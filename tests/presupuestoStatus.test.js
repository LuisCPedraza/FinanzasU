import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calcularEstadoPresupuesto,
  normalizarUmbralAlertaPct,
  DEFAULT_UMBRAL_ALERTA_PCT
} from '../src/utils/presupuestoStatus.js'
import { validatePresupuestoUmbralForm } from '../src/utils/validationHelpers.js'

test('normaliza umbral de alerta a un rango valido', () => {
  assert.equal(normalizarUmbralAlertaPct(undefined), DEFAULT_UMBRAL_ALERTA_PCT)
  assert.equal(normalizarUmbralAlertaPct('92'), 92)
  assert.equal(normalizarUmbralAlertaPct(0), 1)
  assert.equal(normalizarUmbralAlertaPct(150), 100)
})

test('calcula el estado de presupuesto usando el umbral configurable', () => {
  const verde = calcularEstadoPresupuesto({ gastado: 70, monto_limite: 100, umbral_alerta_pct: 80 })
  const amarillo = calcularEstadoPresupuesto({ gastado: 85, monto_limite: 100, umbral_alerta_pct: 80 })
  const rojo = calcularEstadoPresupuesto({ gastado: 120, monto_limite: 100, umbral_alerta_pct: 80 })

  assert.equal(verde.estado, 'verde')
  assert.equal(verde.porcentaje, 70)
  assert.equal(amarillo.estado, 'amarillo')
  assert.equal(amarillo.porcentaje, 85)
  assert.equal(rojo.estado, 'rojo')
  assert.equal(rojo.restante, 0)
})

test('valida el formulario con umbral obligatorio y en rango', () => {
  const errors = validatePresupuestoUmbralForm({
    categoria_id: '',
    monto_limite: '100000',
    umbral_alerta_pct: '120'
  })

  assert.equal(Boolean(errors.categoria_id), true)
  assert.equal(errors.umbral_alerta_pct, 'El umbral debe estar entre 1 y 100')
})