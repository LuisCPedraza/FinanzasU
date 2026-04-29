export function formatMoneda(valor) {
  if (valor === null || valor === undefined) return '$0'
  
  const num = typeof valor === 'string' ? parseFloat(valor) : valor
  
  if (isNaN(num)) return '$0'
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}
