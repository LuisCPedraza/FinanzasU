import * as XLSX from 'xlsx'

/**
 * Genera y descarga un archivo .xlsx con las transacciones recibidas.
 *
 * Columnas: Fecha | Descripcion | Categoria | Tipo | Monto
 *
 * Reglas de formato:
 * - Fecha:       texto ISO YYYY-MM-DD
 * - Descripcion: texto plano
 * - Categoria:   nombre de la categoría (sin emoji para mejor compatibilidad)
 * - Tipo:        "ingreso" o "gasto"
 * - Monto:       número sin formato (Excel aplica formato de celda numérica)
 *
 * @param {Array}  transacciones  Array de objetos de transacción ya filtrados
 * @param {Array}  categorias     Array de categorías para resolver nombres
 * @param {string} nombreArchivo  Nombre del archivo sin extensión
 */
export function exportarExcel(transacciones, categorias, nombreArchivo) {
  const resolverCategoria = (catId) => {
    const cat = categorias.find((c) => c.id === catId)
    return cat ? cat.nombre : 'Sin categoria'
  }

  // Construir filas como objetos (SheetJS las convierte con encabezados automáticos)
  const filas = transacciones.map((t) => ({
    Fecha: t.fecha,
    Descripcion: t.descripcion || '',
    Categoria: resolverCategoria(t.categoria_id),
    Tipo: t.tipo,
    Monto: Number(t.monto)
  }))

  // Crear hoja a partir de los objetos
  const hoja = XLSX.utils.json_to_sheet(filas)

  // Ancho de columnas (en caracteres)
  hoja['!cols'] = [
    { wch: 12 },  // Fecha
    { wch: 35 },  // Descripcion
    { wch: 20 },  // Categoria
    { wch: 10 },  // Tipo
    { wch: 14 }   // Monto
  ]

  // Formato moneda COP para la columna Monto (columna E, índice 4)
  const rango = XLSX.utils.decode_range(hoja['!ref'])
  for (let fila = rango.s.r + 1; fila <= rango.e.r; fila++) {
    const celda = hoja[XLSX.utils.encode_cell({ r: fila, c: 4 })]
    if (celda && celda.t === 'n') {
      celda.z = '"$"#,##0'
    }
  }

  const libro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(libro, hoja, 'Transacciones')

  XLSX.writeFile(libro, `${nombreArchivo}.xlsx`)
}
