/**
 * Validaciones compartidas para formularios
 * Evita duplicidad de lógica en diferentes páginas
 */

// Validadores reutilizables
export const validators = {
  required: (value, field) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${field} es obligatorio`
    }
    return ''
  },

  minLength: (value, minLength, field) => {
    if (value && value.length < minLength) {
      return `${field} debe tener mínimo ${minLength} caracteres`
    }
    return ''
  },

  email: (value) => {
    if (!value) return ''
    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(value)) {
      return 'Correo no válido'
    }
    return ''
  },

  monto: (value, field = 'Monto') => {
    if (!value) return `${field} es obligatorio`
    const num = parseFloat(String(value))
    if (isNaN(num)) {
      return `${field} debe ser un número válido`
    }
    if (num <= 0) {
      return `${field} debe ser mayor a 0`
    }
    return ''
  },

  fecha: (value, field = 'Fecha') => {
    if (!value) return `${field} es obligatoria`
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      return `${field} no es válida`
    }
    return ''
  },

  passwordMatch: (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return 'Las contraseñas no coinciden'
    }
    return ''
  },

  select: (value, field) => {
    if (!value) {
      return `${field} es obligatorio`
    }
    return ''
  },

  montoLimite: (value, field = 'Monto límite') => {
    if (!value) return `${field} es obligatorio`
    const num = parseFloat(value)
    if (isNaN(num)) {
      return `${field} debe ser un número válido`
    }
    if (num <= 0) {
      return `${field} debe ser mayor a 0`
    }
    if (num > 999999999) {
      return `${field} no puede exceder 999.999.999`
    }
    return ''
  },

  nombre: (value) => {
    if (!value || !value.trim()) {
      return 'El nombre es obligatorio'
    }
    if (value.trim().length < 2) {
      return 'El nombre debe tener mínimo 2 caracteres'
    }
    return ''
  },
}

// Validadores de formularios completos
export const formValidators = {
  transaccion: (form) => {
    const errors = {}
    errors.monto = validators.monto(form.monto)
    errors.categoria_id = validators.select(form.categoria_id, 'Categoría')
    errors.fecha = validators.fecha(form.fecha)
    
    // Eliminar errores vacíos
    return Object.fromEntries(Object.entries(errors).filter(([_, v]) => v))
  },

  categoria: (form) => {
    const errors = {}
    errors.nombre = validators.nombre(form.nombre)
    
    return Object.fromEntries(Object.entries(errors).filter(([_, v]) => v))
  },

  presupuesto: (form) => {
    const errors = {}
    errors.categoria_id = validators.select(form.categoria_id, 'Categoría')
    errors.monto_limite = validators.montoLimite(form.monto_limite)
    
    return Object.fromEntries(Object.entries(errors).filter(([_, v]) => v))
  },

  perfil: (form) => {
    const errors = {}
    errors.nombre = validators.nombre(form.nombre)
    
    return Object.fromEntries(Object.entries(errors).filter(([_, v]) => v))
  },

  password: (form) => {
    const errors = {}
    
    if (!form.newPassword) {
      errors.newPassword = 'La nueva contraseña es obligatoria'
    } else if (form.newPassword.length < 6) {
      errors.newPassword = 'Mínimo 6 caracteres'
    }
    
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Confirmar contraseña es obligatoria'
    }
    
    if (form.newPassword && form.confirmPassword) {
      const matchError = validators.passwordMatch(form.newPassword, form.confirmPassword)
      if (matchError) errors.confirmPassword = matchError
    }
    
    return Object.fromEntries(Object.entries(errors).filter(([_, v]) => v))
  },
}

// Utilidad para verificar si hay errores
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0
}

// Utilidad para obtener error de un campo
export const getFieldError = (errors, fieldName) => {
  return errors[fieldName] || undefined
}
