export function validateRequired(value, fieldName = 'Este campo') {
  if (value === null || value === undefined || String(value).trim() === '') {
    return `${fieldName} es obligatorio`
  }
  return null
}

export function validateMonto(value) {
  if (value === null || value === undefined || value === '') {
    return 'El monto es obligatorio'
  }
  const num = Number(value)
  if (isNaN(num)) return 'El monto debe ser un valor numerico'
  if (num <= 0) return 'El monto debe ser mayor a 0'
  return null
}

export function validateFecha(value) {
  if (!value) return 'La fecha es obligatoria'
  const date = new Date(value)
  if (isNaN(date.getTime())) return 'La fecha no es valida'
  return null
}

export function validateNombre(value, min = 2, max = 50) {
  if (!value || !String(value).trim()) return 'El nombre es obligatorio'
  const trimmed = String(value).trim()
  if (trimmed.length < min) return `Minimo ${min} caracteres`
  if (trimmed.length > max) return `Maximo ${max} caracteres`
  return null
}

export function validateTransaccionForm({ tipo, monto, categoria_id, fecha }) {
  const errors = {}
  const tipoErr = validateRequired(tipo, 'El tipo')
  if (tipoErr) errors.tipo = tipoErr
  else if (!['ingreso', 'gasto'].includes(tipo)) errors.tipo = 'Tipo no valido'

  const montoErr = validateMonto(monto)
  if (montoErr) errors.monto = montoErr

  const catErr = validateRequired(categoria_id, 'La categoria')
  if (catErr) errors.categoria_id = catErr

  const fechaErr = validateFecha(fecha)
  if (fechaErr) errors.fecha = fechaErr

  return errors
}

export function validateCategoriaForm({ nombre, tipo }) {
  const errors = {}
  const nombreErr = validateNombre(nombre)
  if (nombreErr) errors.nombre = nombreErr

  const tipoErr = validateRequired(tipo, 'El tipo')
  if (tipoErr) errors.tipo = tipoErr
  else if (!['ingreso', 'gasto'].includes(tipo)) errors.tipo = 'Tipo no valido'

  return errors
}

export function validatePresupuestoForm({ categoria_id, monto_limite }) {
  const errors = {}
  const catErr = validateRequired(categoria_id, 'La categoria')
  if (catErr) errors.categoria_id = catErr

  const montoErr = validateMonto(monto_limite)
  if (montoErr) errors.monto_limite = montoErr

  return errors
}

export function hasErrors(errorsObj) {
  if (!errorsObj) return false
  return Object.values(errorsObj).some((v) => v)
}
