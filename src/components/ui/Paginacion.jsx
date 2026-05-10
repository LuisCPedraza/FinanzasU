import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGE_SIZES } from '../../hooks/useTransaccionesFiltros'

export default function Paginacion({
  pagina,
  totalPaginas,
  porPagina,
  total,
  onCambiarPagina,
  onCambiarPorPagina
}) {
  const inicio = total === 0 ? 0 : (pagina - 1) * porPagina + 1
  const fin = Math.min(pagina * porPagina, total)

  // Genera números de página con elipsis inteligente
  const generarPaginas = () => {
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1)
    }
    const set = new Set([1, totalPaginas, pagina, pagina - 1, pagina + 1].filter(
      (p) => p >= 1 && p <= totalPaginas
    ))
    return [...set].sort((a, b) => a - b)
  }

  const paginas = generarPaginas()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
      {/* Selector de registros por página + resumen */}
      <div className="flex items-center gap-1.5 text-sm text-[#757684] flex-wrap">
        <span>Mostrar</span>
        {PAGE_SIZES.map((n) => (
          <button
            key={n}
            onClick={() => onCambiarPorPagina(n)}
            className={[
              'px-2.5 py-1 rounded-lg text-sm font-semibold transition-colors',
              porPagina === n
                ? 'bg-[#dee0ff] text-[#24389c]'
                : 'text-[#454652] hover:bg-[#f3f4f5]'
            ].join(' ')}
          >
            {n}
          </button>
        ))}
        <span>por pagina</span>
        {total > 0 && (
          <span className="text-[#454652]">
            · {inicio}–{fin} de {total}
          </span>
        )}
      </div>

      {/* Controles de página */}
      {totalPaginas > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onCambiarPagina(pagina - 1)}
            disabled={pagina === 1}
            aria-label="Página anterior"
            className="p-1.5 rounded-lg text-[#454652] hover:bg-[#dee0ff] hover:text-[#24389c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {paginas.map((p, i) => {
            const prev = paginas[i - 1]
            const showEllipsis = prev !== undefined && p - prev > 1
            return (
              <span key={p} className="flex items-center gap-1">
                {showEllipsis && (
                  <span className="px-1 text-[#757684] text-sm select-none">…</span>
                )}
                <button
                  onClick={() => onCambiarPagina(p)}
                  aria-label={`Ir a página ${p}`}
                  aria-current={p === pagina ? 'page' : undefined}
                  className={[
                    'w-8 h-8 rounded-lg text-sm font-semibold transition-colors',
                    p === pagina
                      ? 'bg-[#24389c] text-white'
                      : 'text-[#454652] hover:bg-[#dee0ff] hover:text-[#24389c]'
                  ].join(' ')}
                >
                  {p}
                </button>
              </span>
            )
          })}

          <button
            onClick={() => onCambiarPagina(pagina + 1)}
            disabled={pagina === totalPaginas}
            aria-label="Página siguiente"
            className="p-1.5 rounded-lg text-[#454652] hover:bg-[#dee0ff] hover:text-[#24389c] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
