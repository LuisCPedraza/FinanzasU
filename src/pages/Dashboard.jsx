import { useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useInitialData } from '../hooks/useInitialData'
import { useAppDataContext } from '../context/AppDataContext'
import { Link } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Send,
  Utensils,
  Bus,
  GraduationCap,
  Banknote,
  ShoppingBag,
  Gamepad2,
  TrendingUp,
  Target,
  CreditCard,
  Wallet
} from 'lucide-react'

// ─── Helpers ─────────────────────────────────────────────────────
function formatMoney(n) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n)
}

function formatMoneyShort(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

function formatFecha(fechaStr) {
  const fecha = new Date(fechaStr + 'T00:00:00')
  const hoy = new Date()
  const ayer = new Date()
  ayer.setDate(ayer.getDate() - 1)

  if (fecha.toDateString() === hoy.toDateString()) return 'Hoy'
  if (fecha.toDateString() === ayer.toDateString()) return 'Ayer'

  return new Intl.DateTimeFormat('es-CO', {
    month: 'short',
    day: 'numeric'
  }).format(fecha)
}

const CATEGORY_ICONS = {
  comida: Utensils,
  alimentacion: Utensils,
  transporte: Bus,
  educacion: GraduationCap,
  estudios: GraduationCap,
  salario: Banknote,
  ingreso: Banknote,
  entretenimiento: Gamepad2,
  compras: ShoppingBag
}

const PIE_COLORS = ['#24389c', '#006d36', '#7c2500', '#3f51b5', '#ba1a1a', '#454652']

function getCategoryIcon(nombre) {
  const key = (nombre || '').toLowerCase().trim()
  for (const [k, Icon] of Object.entries(CATEGORY_ICONS)) {
    if (key.includes(k)) return Icon
  }
  return CreditCard
}

// ─── Component ───────────────────────────────────────────────────
export default function Dashboard() {
  const { usuario } = useAuth()
  const { transacciones, categorias, presupuestos, cargandoDatos, errorGlobal } = useInitialData()
  const { totales } = useAppDataContext()

  // Current month transactions
  const mesActual = useMemo(() => {
    const now = new Date()
    return { mes: now.getMonth() + 1, anio: now.getFullYear() }
  }, [])

  const transaccionesMes = useMemo(() => {
    return transacciones.filter((t) => {
      const [anioTxt, mesTxt] = String(t.fecha || '').split('-')
      return Number(mesTxt) === mesActual.mes && Number(anioTxt) === mesActual.anio
    })
  }, [transacciones, mesActual])

  const flujoMensual = useMemo(() => {
    const ingresos = transaccionesMes
      .filter((t) => t.tipo === 'ingreso')
      .reduce((acc, t) => acc + Number(t.monto || 0), 0)
    const gastos = transaccionesMes
      .filter((t) => t.tipo === 'gasto')
      .reduce((acc, t) => acc + Number(t.monto || 0), 0)
    return { ingresos, gastos }
  }, [transaccionesMes])

  // Mini bars: last 5 months breakdown
  const miniBarras = useMemo(() => {
    const meses = []
    const now = new Date()
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      meses.push({ mes: d.getMonth() + 1, anio: d.getFullYear() })
    }

    const ingresoPorMes = meses.map(({ mes, anio }) => {
      return transacciones
        .filter((t) => {
          if (t.tipo !== 'ingreso') return false
          const [a, m] = String(t.fecha || '').split('-')
          return Number(m) === mes && Number(a) === anio
        })
        .reduce((acc, t) => acc + Number(t.monto || 0), 0)
    })

    const gastoPorMes = meses.map(({ mes, anio }) => {
      return transacciones
        .filter((t) => {
          if (t.tipo !== 'gasto') return false
          const [a, m] = String(t.fecha || '').split('-')
          return Number(m) === mes && Number(a) === anio
        })
        .reduce((acc, t) => acc + Number(t.monto || 0), 0)
    })

    const maxIngreso = Math.max(...ingresoPorMes, 1)
    const maxGasto = Math.max(...gastoPorMes, 1)

    return {
      ingresos: ingresoPorMes.map((v) => Math.round((v / maxIngreso) * 100)),
      gastos: gastoPorMes.map((v) => Math.round((v / maxGasto) * 100))
    }
  }, [transacciones])

  // Category breakdown for expenses
  const gastosPorCategoria = useMemo(() => {
    const gastos = transaccionesMes.filter((t) => t.tipo === 'gasto')
    const totalGastos = gastos.reduce((acc, t) => acc + Number(t.monto || 0), 0)
    if (totalGastos === 0) return []

    const porCategoria = {}
    gastos.forEach((t) => {
      const catId = t.categoria_id
      if (!porCategoria[catId]) porCategoria[catId] = 0
      porCategoria[catId] += Number(t.monto || 0)
    })

    return Object.entries(porCategoria)
      .map(([catId, monto]) => {
        const cat = categorias.find((c) => String(c.id) === String(catId))
        return {
          nombre: cat?.nombre || 'Otros',
          monto,
          porcentaje: Math.round((monto / totalGastos) * 100)
        }
      })
      .sort((a, b) => b.monto - a.monto)
      .slice(0, 4)
  }, [transaccionesMes, categorias])

  // Recent transactions (last 4)
  const recientes = useMemo(() => {
    return [...transacciones]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 4)
      .map((t) => {
        const cat = categorias.find((c) => String(c.id) === String(t.categoria_id))
        return { ...t, categoriaNombre: cat?.nombre || 'Sin categoría' }
      })
  }, [transacciones, categorias])

  // General budget summary (all budgets for current month)
  const resumenPresupuestos = useMemo(() => {
    if (!presupuestos.length) return null

    const presupuestosMes = presupuestos.filter(
      (p) => Number(p.mes) === mesActual.mes && Number(p.anio) === mesActual.anio
    )
    // If no budgets for current month, use all budgets
    const lista = presupuestosMes.length > 0 ? presupuestosMes : presupuestos

    let totalLimite = 0
    let totalGastado = 0

    const detalle = lista.map((p) => {
      const cat = categorias.find((c) => String(c.id) === String(p.categoria_id))
      const gastado = transacciones
        .filter((t) => {
          if (t.tipo !== 'gasto') return false
          if (String(t.categoria_id) !== String(p.categoria_id)) return false
          const [a, m] = String(t.fecha || '').split('-')
          return Number(m) === Number(p.mes) && Number(a) === Number(p.anio)
        })
        .reduce((acc, t) => acc + Number(t.monto || 0), 0)
      const limite = Number(p.monto_limite || 0)
      totalLimite += limite
      totalGastado += gastado
      const porcentaje = limite > 0 ? Math.min(Math.round((gastado / limite) * 100), 100) : 0
      return {
        nombre: cat?.nombre || 'Sin categoría',
        gastado,
        limite,
        porcentaje
      }
    }).sort((a, b) => b.porcentaje - a.porcentaje).slice(0, 3)

    const porcentajeGlobal = totalLimite > 0 ? Math.min(Math.round((totalGastado / totalLimite) * 100), 100) : 0

    return {
      totalGastado,
      totalLimite,
      porcentajeGlobal,
      restante: Math.max(totalLimite - totalGastado, 0),
      cantidad: lista.length,
      detalle
    }
  }, [presupuestos, categorias, transacciones, mesActual])

  // SVG pie chart data
  const pieData = useMemo(() => {
    if (!gastosPorCategoria.length) return []
    let offset = 0
    return gastosPorCategoria.map((cat, i) => {
      const item = {
        porcentaje: cat.porcentaje,
        offset: -offset,
        color: PIE_COLORS[i % PIE_COLORS.length]
      }
      offset += cat.porcentaje
      return item
    })
  }, [gastosPorCategoria])

  // ─── Loading State ──────────────────────────────────────────────
  if (cargandoDatos) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#dee0ff] border-t-[#24389c] animate-spin" />
          <p className="text-sm text-[#757684] font-medium">Cargando tu dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Error Banner */}
      {errorGlobal && (
        <div className="rounded-xl bg-[#ffdad6] text-[#93000a] px-5 py-3 text-sm font-medium">
          Error de carga: {errorGlobal}
        </div>
      )}

      {/* ─── Hero Grid: Saldo Total & Meta ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saldo Total Card */}
        <div className="lg:col-span-2 editorial-gradient p-8 rounded-2xl text-white relative overflow-hidden shadow-xl shadow-[#24389c]/20">
          <div className="relative z-10">
            <p className="text-sm font-medium opacity-80 mb-2 uppercase tracking-[0.15em]">
              Saldo Total Disponible
            </p>
            <h3 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tighter mb-10">
              {formatMoney(totales.balance)}
            </h3>
            <div className="flex gap-4 flex-wrap">
              <Link
                to="/transacciones"
                className="bg-[#83fba5] text-[#00210c] px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Depositar
              </Link>
              <Link
                to="/transacciones"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition-all"
              >
                <Send className="w-4 h-4" />
                Transferir
              </Link>
            </div>
          </div>
          {/* Decorative overlays */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute right-20 top-0 w-32 h-32 bg-[#006d36]/20 rounded-full blur-2xl" />
        </div>

        {/* Resumen General de Presupuestos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col justify-between border border-[#c5c5d4]/20">
          {resumenPresupuestos ? (
            <>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#24389c]" />
                    <h4 className="font-headline font-bold text-lg text-[#191c1d]">
                      Presupuestos
                    </h4>
                  </div>
                  <span className="bg-[#dee0ff] text-[#24389c] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">
                    {resumenPresupuestos.cantidad} activo{resumenPresupuestos.cantidad !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-2xl font-headline font-bold text-[#191c1d] mb-1">
                  {formatMoney(resumenPresupuestos.totalGastado)}{' '}
                  <span className="text-sm text-[#757684] font-normal">
                    / {formatMoney(resumenPresupuestos.totalLimite)}
                  </span>
                </p>
                <div className="flex justify-between text-xs font-semibold text-[#757684] uppercase tracking-wider mt-2 mb-1">
                  <span>Uso global</span>
                  <span>{resumenPresupuestos.porcentajeGlobal}%</span>
                </div>
                <div className="h-2.5 w-full bg-[#dee0ff]/50 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${resumenPresupuestos.porcentajeGlobal}%`,
                      backgroundColor:
                        resumenPresupuestos.porcentajeGlobal > 90
                          ? '#ba1a1a'
                          : resumenPresupuestos.porcentajeGlobal > 70
                            ? '#7c2500'
                            : '#006d36'
                    }}
                  />
                </div>
                <p className="text-[11px] text-[#757684] italic mb-4">
                  {resumenPresupuestos.restante > 0
                    ? `Restan ${formatMoney(resumenPresupuestos.restante)} en total.`
                    : '¡Presupuestos al límite!'}
                </p>
              </div>
              {/* Individual budget mini-bars */}
              <div className="space-y-3 pt-3 border-t border-[#c5c5d4]/15">
                {resumenPresupuestos.detalle.map((d) => (
                  <div key={d.nombre}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-[#454652] truncate">{d.nombre}</span>
                      <span className="text-[10px] font-bold text-[#757684] shrink-0 ml-2">
                        {formatMoney(d.gastado)} / {formatMoney(d.limite)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#f3f4f5] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${d.porcentaje}%`,
                          backgroundColor:
                            d.porcentaje > 90 ? '#ba1a1a' : d.porcentaje > 70 ? '#7c2500' : '#24389c'
                        }}
                      />
                    </div>
                  </div>
                ))}
                <Link
                  to="/presupuestos"
                  className="text-[#24389c] text-xs font-bold hover:underline block text-right pt-1"
                >
                  Ver todos →
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-8">
              <div className="w-14 h-14 rounded-2xl editorial-gradient flex items-center justify-center shadow-lg shadow-[#24389c]/20">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div className="text-center">
                <h4 className="font-headline font-bold text-[#191c1d] mb-1">Sin presupuestos</h4>
                <p className="text-xs text-[#757684]">Crea tu primer presupuesto para rastrear tus gastos</p>
              </div>
              <Link
                to="/presupuestos"
                className="bg-[#dee0ff] text-[#24389c] px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#cacfff] transition-colors"
              >
                Crear presupuesto
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ─── Stats Grid: Flujo Mensual & Categorías ────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Flujo Mensual */}
        <div className="bg-white p-6 rounded-2xl border border-[#c5c5d4]/10">
          <h4 className="font-headline font-bold text-[#191c1d] mb-8">Flujo Mensual</h4>
          <div className="grid grid-cols-2 gap-8">
            {/* Ingresos */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownLeft className="w-4 h-4 text-[#006d36]" />
                  <span className="text-xs font-bold text-[#757684] uppercase tracking-tighter">
                    Ingresos
                  </span>
                </div>
                <p className="text-2xl font-headline font-bold text-[#191c1d]">
                  {formatMoney(flujoMensual.ingresos)}
                </p>
              </div>
              <div className="flex items-end gap-1.5 h-16 pt-2">
                {miniBarras.ingresos.map((h, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t transition-all duration-300 ${
                      i === miniBarras.ingresos.length - 1
                        ? 'bg-[#006d36]'
                        : 'bg-[#006d36]/20 hover:bg-[#006d36]/40'
                    }`}
                    style={{ height: `${Math.max(h, 8)}%` }}
                  />
                ))}
              </div>
            </div>

            {/* Gastos */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight className="w-4 h-4 text-[#7c2500]" />
                  <span className="text-xs font-bold text-[#757684] uppercase tracking-tighter">
                    Gastos
                  </span>
                </div>
                <p className="text-2xl font-headline font-bold text-[#191c1d]">
                  {formatMoney(flujoMensual.gastos)}
                </p>
              </div>
              <div className="flex items-end gap-1.5 h-16 pt-2">
                {miniBarras.gastos.map((h, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t transition-all duration-300 ${
                      i === miniBarras.gastos.length - 1
                        ? 'bg-[#7c2500]'
                        : 'bg-[#7c2500]/20 hover:bg-[#7c2500]/40'
                    }`}
                    style={{ height: `${Math.max(h, 8)}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gastos por Categoría */}
        <div className="bg-white p-6 rounded-2xl border border-[#c5c5d4]/10 flex flex-col md:flex-row items-center gap-8">
          {/* Pie Chart SVG */}
          <div className="relative w-40 h-40 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="15.9" fill="transparent"
                stroke="#dee0ff" strokeWidth="3.8"
              />
              {pieData.map((slice, i) => (
                <circle
                  key={i}
                  cx="18" cy="18" r="15.9" fill="transparent"
                  stroke={slice.color}
                  strokeWidth="4.2"
                  strokeDasharray={`${slice.porcentaje} ${100 - slice.porcentaje}`}
                  strokeDashoffset={slice.offset}
                  className="transition-all duration-500"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-[10px] text-[#757684] font-bold uppercase tracking-widest">
                Total
              </span>
              <span className="text-sm font-headline font-bold text-[#191c1d]">
                {formatMoneyShort(flujoMensual.gastos)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="w-full space-y-3">
            <h4 className="font-headline font-bold text-[#191c1d] mb-2">Gastos por Categoría</h4>
            {gastosPorCategoria.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {gastosPorCategoria.map((cat, i) => (
                  <div key={cat.nombre} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                    />
                    <span className="text-xs font-medium text-[#454652] truncate">
                      {cat.nombre} ({cat.porcentaje}%)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#757684] italic">No hay gastos registrados este mes.</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Transacciones Recientes ───────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h4 className="font-headline font-bold text-2xl text-[#191c1d]">
              Transacciones Recientes
            </h4>
            <p className="text-[#757684] text-sm">Tus últimos movimientos financieros</p>
          </div>
          <Link
            to="/transacciones"
            className="text-[#24389c] font-bold text-sm hover:underline"
          >
            Ver Todo
          </Link>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#c5c5d4]/5">
          {recientes.length > 0 ? (
            <div className="divide-y divide-[#f3f4f5]">
              {recientes.map((t) => {
                const IconComponent = getCategoryIcon(t.categoriaNombre)
                const esIngreso = t.tipo === 'ingreso'
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-5 hover:bg-[#f8f9fa] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#f3f4f5] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: esIngreso ? '#006d36' : '#24389c' }}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-[#191c1d]">{t.descripcion || t.categoriaNombre}</p>
                        <p className="text-xs text-[#757684]">
                          {formatFecha(t.fecha)} • {t.categoriaNombre}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-headline font-bold"
                        style={{ color: esIngreso ? '#006d36' : '#7c2500' }}
                      >
                        {esIngreso ? '+' : '-'}{formatMoney(Number(t.monto || 0))}
                      </p>
                      <p className="text-[10px] text-[#757684] font-bold uppercase tracking-tighter">
                        {t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#dee0ff] flex items-center justify-center">
                <Wallet className="w-7 h-7 text-[#24389c]" />
              </div>
              <div className="text-center">
                <p className="font-headline font-bold text-[#191c1d] mb-1">Sin transacciones</p>
                <p className="text-xs text-[#757684]">Registra tu primera transacción para comenzar</p>
              </div>
              <Link
                to="/transacciones"
                className="editorial-gradient text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-[#24389c]/20 hover:opacity-90 transition-opacity"
              >
                Nueva transacción
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}