/**
 * Genera y descarga un archivo CSV con las transacciones recibidas.
 *
 * Reglas de serialización:
 * - Separador: coma (,)
 * - Codificación: UTF-8 con BOM (para compatibilidad con Excel en Windows)
 * - Campos con comas, comillas o saltos de línea se encierran entre comillas dobles
 * - Las comillas internas se escapan duplicándolas ("")
 * - Monto: número plano sin símbolo de moneda ni puntos de miles (ej: 15000)
 * - Tipo: "ingreso" o "gasto" en minúsculas
 * - Fecha: ISO YYYY-MM-DD tal como viene de la base de datos
 *
 * @param {Array}  transacciones  Array de objetos de transacción ya filtrados
 * @param {Array}  categorias     Array de categorías para resolver nombres
 * @param {string} nombreArchivo  Nombre del archivo sin extensión
 */
export function exportarCSV(transacciones, categorias, nombreArchivo) {
  const escapar = (valor) => {
    const str = valor === null || valor === undefined ? '' : String(valor)
    // Si contiene coma, comilla doble o salto de línea → envolver en comillas y escapar comillas internas
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const resolverCategoria = (catId) => {
    const cat = categorias.find((c) => c.id === catId)
    if (!cat) return 'Sin categoria'
    // Quitar emojis del nombre para mejor compatibilidad con Excel
    return cat.nombre
  }

  const ENCABEZADOS = ['Fecha', 'Descripcion', 'Categoria', 'Tipo', 'Monto']

  const filas = transacciones.map((t) => [
    escapar(t.fecha),
    escapar(t.descripcion || ''),
    escapar(resolverCategoria(t.categoria_id)),
    escapar(t.tipo),
    escapar(t.monto)
  ])

  const contenido = [
    'sep=,',          // indica a Excel el separador, funciona en cualquier locale
    ENCABEZADOS.join(','),
    ...filas.map((f) => f.join(','))
  ].join('\r\n')

  // BOM UTF-8 para que Excel reconozca tildes y caracteres especiales
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + contenido], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${nombreArchivo}.csv`
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Liberar memoria
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
