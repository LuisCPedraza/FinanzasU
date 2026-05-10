import { useState } from 'react'
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { MESES } from '../../utils/constants'

export default function FiltrosTransacciones({
  filtros,
  onChange,
  onLimpiar,
  hayFiltros,
  conteoFiltros,
  categorias,
  anios,
  meses
}) {
  const [abierto, setAbierto] = useState(false)

  const toggleMulti = (campo, valor) => {
    const actual = filtros[campo]
    const nuevo = actual.includes(valor)
      ? actual.filter((v) => v !== valor)
      : [...actual, valor]
    onChange(campo, nuevo)
  }

  return (
    <div className="bg-white rounded-2xl border border-[#c5c5d4]/30 shadow-sm overflow-hidden">
      {/* Fila siempre visible: búsqueda + botón filtros */}
      <div className="flex gap-3 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#757684] pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por descripcion..."
            value={filtros.texto}
            onChange={(e) => onChange('texto', e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#c5c5d4]/40 bg-white text-sm text-[#191c1d] placeholder:text-[#757684]/60 focus:outline-none focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all"
          />
        </div>
        <button
          onClick={() => setAbierto((v) => !v)}
          className={[
            'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all',
            abierto || conteoFiltros > 0
              ? 'bg-[#dee0ff] border-[#24389c]/30 text-[#24389c]'
              : 'border-[#c5c5d4]/40 text-[#454652] hover:bg-[#f3f4f5]'
          ].join(' ')}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filtros</span>
          {conteoFiltros > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#24389c] text-white text-[10px] font-bold leading-none">
              {conteoFiltros}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Panel colapsable */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          abierto ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-5 space-y-5 border-t border-[#c5c5d4]/20 pt-4">

            {/* Tipo */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">Tipo</p>
              <div className="flex gap-2">
                {[
                  { value: '', label: 'Todos' },
                  { value: 'ingreso', label: 'Ingresos' },
                  { value: 'gasto', label: 'Gastos' }
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      onChange('tipo', value)
                      onChange('categoriaIds', [])
                    }}
                    className={[
                      'px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all',
                      filtros.tipo === value
                        ? value === 'ingreso'
                          ? 'bg-[#83fba5]/30 border-[#006d36]/30 text-[#006d36]'
                          : value === 'gasto'
                          ? 'bg-[#ffdad6]/50 border-[#93000a]/30 text-[#93000a]'
                          : 'bg-[#dee0ff] border-[#24389c]/30 text-[#24389c]'
                        : 'border-[#c5c5d4]/40 text-[#757684] hover:bg-[#f3f4f5]'
                    ].join(' ')}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Meses */}
            {meses.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">
                Meses
                {filtros.meses.length > 0 && (
                  <span className="ml-1.5 normal-case text-[#24389c]">
                    · {filtros.meses.length} seleccionado{filtros.meses.length > 1 ? 's' : ''}
                  </span>
                )}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                {meses.map((num) => {
                  const val = String(num)
                  const activo = filtros.meses.includes(val)
                  return (
                    <button
                      key={val}
                      onClick={() => toggleMulti('meses', val)}
                      className={[
                        'py-1.5 rounded-lg text-xs font-semibold border transition-all text-center',
                        activo
                          ? 'bg-[#dee0ff] border-[#24389c]/30 text-[#24389c]'
                          : 'border-[#c5c5d4]/40 text-[#757684] hover:bg-[#f3f4f5]'
                      ].join(' ')}
                    >
                      {MESES[num - 1].slice(0, 3)}
                    </button>
                  )
                })}
              </div>
            </div>
            )}

            {/* Años */}
            {anios.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">
                  Años
                  {filtros.anios.length > 0 && (
                    <span className="ml-1.5 normal-case text-[#24389c]">
                      · {filtros.anios.length} seleccionado{filtros.anios.length > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {anios.map((a) => {
                    const val = String(a)
                    const activo = filtros.anios.includes(val)
                    return (
                      <button
                        key={val}
                        onClick={() => toggleMulti('anios', val)}
                        className={[
                          'py-1.5 px-4 rounded-lg text-xs font-semibold border transition-all',
                          activo
                            ? 'bg-[#dee0ff] border-[#24389c]/30 text-[#24389c]'
                            : 'border-[#c5c5d4]/40 text-[#757684] hover:bg-[#f3f4f5]'
                        ].join(' ')}
                      >
                        {a}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Categorías */}
            {categorias.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">
                  Categorias
                  {filtros.tipo && (
                    <span className="ml-1.5 normal-case text-[#757684]/60">
                      ({filtros.tipo === 'ingreso' ? 'ingresos' : 'gastos'})
                    </span>
                  )}
                  {filtros.categoriaIds.length > 0 && (
                    <span className="ml-1.5 normal-case text-[#24389c]">
                      · {filtros.categoriaIds.length} seleccionada{filtros.categoriaIds.length > 1 ? 's' : ''}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(filtros.tipo ? categorias.filter((c) => c.tipo === filtros.tipo) : categorias).map((c) => {
                    const val = String(c.id)
                    const activo = filtros.categoriaIds.includes(val)
                    return (
                      <button
                        key={val}
                        onClick={() => toggleMulti('categoriaIds', val)}
                        className={[
                          'inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all',
                          activo
                            ? 'bg-[#dee0ff] border-[#24389c]/30 text-[#24389c]'
                            : 'border-[#c5c5d4]/40 text-[#757684] hover:bg-[#f3f4f5]'
                        ].join(' ')}
                      >
                        {c.icono && <span>{c.icono}</span>}
                        {c.nombre}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Limpiar */}
            {hayFiltros && (
              <div className="flex justify-end pt-1 border-t border-[#c5c5d4]/20">
                <button
                  onClick={onLimpiar}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-[#93000a] bg-[#ffdad6]/40 hover:bg-[#ffdad6] transition-colors"
                >
                  <X className="w-4 h-4" />
                  Limpiar todos los filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
