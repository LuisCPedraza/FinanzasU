import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown, FileSpreadsheet, FileText } from 'lucide-react'
import { exportarExcel } from '../../utils/exportarExcel'
import { exportarCSV } from '../../utils/exportarCSV'

export default function BotonExportarCSV({
  transaccionesPaginadas,
  transaccionesFiltradas,
  categorias,
  filtros
}) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const generarNombre = (scope) => {
    const hoy = new Date()
    let sufijo = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
    if (filtros.anios.length === 1 && filtros.meses.length === 1) {
      sufijo = `${filtros.anios[0]}-${filtros.meses[0].padStart(2, '0')}`
    } else if (filtros.anios.length === 1) {
      sufijo = filtros.anios[0]
    }
    return `transacciones-${sufijo}${scope === 'pagina' ? '-pag' : ''}`
  }

  const handleExportar = (formato, scope) => {
    const datos = scope === 'pagina' ? transaccionesPaginadas : transaccionesFiltradas
    if (datos.length === 0) return
    const nombre = generarNombre(scope)
    if (formato === 'xlsx') exportarExcel(datos, categorias, nombre)
    else exportarCSV(datos, categorias, nombre)
    setAbierto(false)
  }

  const disabled = transaccionesFiltradas.length === 0

  const OpcionFila = ({ formato, scope, icono: Icono, etiquetaFormato }) => {
    const datos = scope === 'pagina' ? transaccionesPaginadas : transaccionesFiltradas
    const count = datos.length
    const etiquetaScope = scope === 'pagina' ? 'Página actual' : 'Todos los resultados'
    return (
      <button
        onClick={() => handleExportar(formato, scope)}
        disabled={count === 0}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#f3f4f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Icono className="w-4 h-4 flex-shrink-0 text-[#24389c]" />
        <span className="flex-1 text-sm text-[#191c1d]">
          {etiquetaScope}
          <span className="ml-1 text-xs text-[#757684]">· {etiquetaFormato}</span>
        </span>
        <span className="text-xs text-[#757684] tabular-nums">{count}</span>
      </button>
    )
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto((v) => !v)}
        disabled={disabled}
        className={[
          'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all',
          disabled
            ? 'border-[#c5c5d4]/40 text-[#c5c5d4] cursor-not-allowed'
            : 'border-[#c5c5d4]/40 text-[#454652] hover:bg-[#f3f4f5] hover:border-[#454652]/40'
        ].join(' ')}
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Exportar</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
        />
      </button>

      {abierto && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-[#c5c5d4]/30 bg-white shadow-xl shadow-black/10 overflow-hidden">

          {/* Sección Excel */}
          <div className="px-4 pt-3 pb-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#757684]">
              Excel (.xlsx)
            </p>
          </div>
          <OpcionFila formato="xlsx" scope="pagina"  icono={FileSpreadsheet} etiquetaFormato="página actual" />
          <OpcionFila formato="xlsx" scope="todos"   icono={FileSpreadsheet} etiquetaFormato="todos los resultados" />

          {/* Sección CSV */}
          <div className="px-4 pt-3 pb-1 border-t border-[#c5c5d4]/20 mt-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#757684]">
              CSV — compatible con Excel
            </p>
          </div>
          <OpcionFila formato="csv" scope="pagina" icono={FileText} etiquetaFormato="página actual" />
          <OpcionFila formato="csv" scope="todos"  icono={FileText} etiquetaFormato="todos los resultados" />

          <div className="px-4 py-2 border-t border-[#c5c5d4]/20 mt-1">
            <p className="text-[10px] text-[#757684]">
              Los valores mostrados son la cantidad de registros a descargar.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

