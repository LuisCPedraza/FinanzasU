import { useState, useEffect, useRef } from 'react'
import {
  Plus, Trash2, Pencil, PiggyBank, ChevronLeft, ChevronRight,
  X, Check, AlertTriangle, TrendingUp, Wallet,
} from 'lucide-react'
import { usePresupuestos } from '@/hooks/usePresupuestos'
import { useCategorias } from '@/hooks/useCategorias'
import { formatMoneda } from '@/utils/formatMoneda'
import { MESES } from '@/utils/constants'
import { formValidators, hasErrors, getFieldError } from '@/utils/validationHelpers'
import Spinner from '@/components/ui/Spinner'

/* ─────────────────────────────────────────────
   Constantes
───────────────────────────────────────────── */
const FORM_INICIAL = { categoria_id: '', monto_limite: '' }

/* ─────────────────────────────────────────────
   Config visual por estado
───────────────────────────────────────────── */
const estadoConfig = {
  verde: {
    bar:   'bg-emerald-500',
    track: 'bg-emerald-100',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon:  <Check className="w-3 h-3" />,
    label: 'Sano',
  },
  amarillo: {
    bar:   'bg-amber-400',
    track: 'bg-amber-100',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon:  <AlertTriangle className="w-3 h-3" />,
    label: 'Alerta',
  },
  rojo: {
    bar:   'bg-rose-500',
    track: 'bg-rose-100',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    icon:  <TrendingUp className="w-3 h-3" />,
    label: 'Excedido',
  },
}

/* ═══════════════════════════════════════════════
   COMPONENTE PRINCIPAL
═══════════════════════════════════════════════ */
export default function Presupuestos() {
  const ahora  = new Date()
  const [mes,  setMes]  = useState(ahora.getMonth() + 1)
  const [anio, setAnio] = useState(ahora.getFullYear())

  const { presupuestos, loading, resumen, crear, actualizar, eliminar } = usePresupuestos(mes, anio)
  const { categorias } = useCategorias('gasto')

  /* ── Estado UI ── */
  const [panelOpen,  setPanelOpen]  = useState(false)
  const [deleteId,   setDeleteId]   = useState(null)
  const [editId,     setEditId]     = useState(null)
  const [form,       setForm]       = useState(FORM_INICIAL)
  const [errores,    setErrores]    = useState({})
  const [cargando,   setCargando]   = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const montoRef = useRef(null)

  const categoriasOpciones = categorias.map((c) => ({
    value: c.id,
    label: `${c.icono} ${c.nombre}`,
  }))

  /* Autoenfoque al editar */
  useEffect(() => {
    if (panelOpen && editId) {
      const t = setTimeout(() => montoRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [panelOpen, editId])

  /* Bloquear scroll del body cuando el panel o modal están abiertos */
  useEffect(() => {
    document.body.style.overflow = panelOpen || deleteId ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [panelOpen, deleteId])

  /* ── Navegación de mes ── */
  const cambiarMes = (d) => {
    let m = mes + d, a = anio
    if (m > 12) { m = 1;  a++ }
    if (m < 1)  { m = 12; a-- }
    setMes(m); setAnio(a)
  }

  /* ── Abrir / cerrar panel ── */
  const abrirCrear = () => {
    setEditId(null)
    setForm(FORM_INICIAL)
    setErrores({})
    setPanelOpen(true)
  }

  const abrirEditar = (p) => {
    setEditId(p.id)
    setForm({ categoria_id: p.categoria_id, monto_limite: String(p.monto_limite) })
    setErrores({})
    setPanelOpen(true)
  }

  const cerrarPanel = () => {
    if (cargando) return
    setPanelOpen(false)
    setTimeout(() => setErrores({}), 300)
  }

  /* ── Handler de campo — valida en tiempo real con formValidators ── */
  const handleChange = (e) => {
    const { name, value } = e.target
    const newForm = { ...form, [name]: value }
    setForm(newForm)
    setErrores(formValidators.presupuesto(newForm))
  }

  /* ── Submit ── */
  const handleSubmit = async () => {
    const errs = formValidators.presupuesto(form)
    setErrores(errs)
    if (hasErrors(errs)) return
    setCargando(true)
    try {
      if (editId) {
        await actualizar(editId, { monto_limite: parseFloat(form.monto_limite) })
      } else {
        await crear({ categoria_id: form.categoria_id, monto_limite: parseFloat(form.monto_limite) })
      }
      cerrarPanel()
    } catch { /* manejado por el hook */ }
    finally   { setCargando(false) }
  }

  /* ── Eliminar ── */
  const confirmarEliminar = async () => {
    if (!deleteId) return
    setEliminando(true)
    try {
      await eliminar(deleteId)
      setDeleteId(null)
    } catch { /* manejado por el hook */ }
    finally   { setEliminando(false) }
  }

  /* ────────────────────────────────────
     RENDER
  ──────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="relative">

      {/* ─── Contenido ─── */}
      <div className="space-y-7 pb-28 sm:pb-10">

        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-on-background">
              Presupuestos
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Límites de gasto para{' '}
              <span className="font-semibold text-primary">{MESES[mes - 1]} {anio}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Navegador de mes */}
            <div className="flex items-center gap-1 bg-surface-container rounded-xl border border-outline-variant/20 p-1">
              <button
                onClick={() => cambiarMes(-1)}
                className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                aria-label="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-on-surface px-2 min-w-[112px] text-center">
                {MESES[mes - 1]} {anio}
              </span>
              <button
                onClick={() => cambiarMes(1)}
                className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
                aria-label="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Botón agregar desktop */}
            <button
              onClick={abrirCrear}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Agregar presupuesto
            </button>
          </div>
        </div>

        {/* Chips de resumen */}
        {presupuestos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <ResumenChip count={resumen.verde}    label="Sanos"     color="emerald" />
            <ResumenChip count={resumen.amarillo} label="En alerta" color="amber"   />
            <ResumenChip count={resumen.rojo}     label="Excedidos" color="rose"    />
          </div>
        )}

        {/* Lista o estado vacío */}
        {presupuestos.length === 0 ? (
          <EstadoVacio onCrear={abrirCrear} />
        ) : (
          <div className="space-y-3">
            {presupuestos.map((p) => (
              <TarjetaPresupuesto
                key={p.id}
                p={p}
                onEditar={() => abrirEditar(p)}
                onEliminar={() => setDeleteId(p.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* FAB móvil */}
      <button
        onClick={abrirCrear}
        className="sm:hidden fixed bottom-6 right-6 z-30 w-14 h-14 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-xl active:scale-95 transition-transform cursor-pointer"
        aria-label="Agregar presupuesto"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* ─────────────────────────────────────────
          OVERLAY PANEL
      ───────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          panelOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={cerrarPanel}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet en móvil, sidebar en desktop */}
      <div
        className={`
          fixed z-50 bg-surface shadow-2xl
          transition-transform duration-300 ease-out
          bottom-0 left-0 right-0 rounded-t-3xl
          max-h-[92dvh] overflow-y-auto
          sm:inset-y-0 sm:left-auto sm:right-0
          sm:bottom-auto sm:rounded-none sm:rounded-l-3xl
          sm:w-[420px] sm:max-h-none sm:overflow-y-auto
          ${panelOpen
            ? 'translate-y-0 sm:translate-y-0 sm:translate-x-0'
            : 'translate-y-full sm:translate-y-0 sm:translate-x-full'
          }
        `}
        role="dialog"
        aria-modal="true"
        aria-label={editId ? 'Editar presupuesto' : 'Nuevo presupuesto'}
      >
        <PanelFormulario
          editId={editId}
          form={form}
          errores={errores}
          cargando={cargando}
          categoriasOpciones={categoriasOpciones}
          presupuestosExistentes={presupuestos}
          montoRef={montoRef}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={cerrarPanel}
        />
      </div>

      {/* ─────────────────────────────────────────
          MODAL CONFIRMAR ELIMINAR
      ───────────────────────────────────────── */}
      {deleteId && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => !eliminando && setDeleteId(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-error-container flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-error" />
                </div>
                <div>
                  <h3 className="font-bold text-on-surface text-lg">Eliminar presupuesto</h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Este límite se eliminará permanentemente. Tus transacciones no se verán afectadas.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={eliminando}
                  className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarEliminar}
                  disabled={eliminando}
                  className="flex-1 py-3 rounded-xl bg-error text-on-error font-semibold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {eliminando
                    ? <><Spinner size="sm" /> Eliminando…</>
                    : <><Trash2 className="w-4 h-4" /> Eliminar</>
                  }
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   PANEL DEL FORMULARIO
═══════════════════════════════════════════════ */
function PanelFormulario({
  editId, form, errores, cargando,
  categoriasOpciones, presupuestosExistentes,
  montoRef, onChange, onSubmit, onClose,
}) {
  /* Deshabilita categorías que ya tienen presupuesto asignado en este mes */
  const categoriasUsadas = new Set(
    presupuestosExistentes
      .filter((p) => p.id !== editId)
      .map((p) => p.categoria_id)
  )

  const hayErrores = hasErrors(errores)

  return (
    <div className="flex flex-col sm:h-full">

      {/* Cabecera */}
      <div className="relative flex items-center justify-between px-6 pt-6 pb-5 border-b border-outline-variant/15 flex-shrink-0">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-10 h-1 bg-outline-variant/40 rounded-full sm:hidden" />
        <div>
          <h3 className="text-lg font-bold text-on-surface">
            {editId ? 'Editar límite' : 'Nuevo presupuesto'}
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {editId
              ? 'Actualiza el monto máximo asignado'
              : 'Define cuánto quieres gastar por categoría'}
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={cargando}
          className="p-2 rounded-xl hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Campos */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

        {/* Selector de categoría — solo al crear */}
        {!editId && (
          <div className="space-y-1.5">
            <label htmlFor="pres-cat" className="block text-sm font-semibold text-on-surface">
              Categoría
            </label>
            <select
              id="pres-cat"
              name="categoria_id"
              value={form.categoria_id}
              onChange={onChange}
              disabled={cargando}
              className={`
                w-full px-4 py-3 rounded-xl border text-on-surface bg-surface-container-lowest
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                disabled:opacity-50 transition-colors text-sm appearance-none cursor-pointer
                ${getFieldError(errores, 'categoria_id')
                  ? 'border-error bg-error-container/10'
                  : 'border-outline-variant/40 hover:border-outline-variant'}
              `}
            >
              <option value="">Selecciona una categoría…</option>
              {categoriasOpciones.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={categoriasUsadas.has(opt.value)}
                >
                  {opt.label}{categoriasUsadas.has(opt.value) ? ' (ya asignada)' : ''}
                </option>
              ))}
            </select>
            {getFieldError(errores, 'categoria_id') && (
              <p className="text-xs text-error flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                {getFieldError(errores, 'categoria_id')}
              </p>
            )}
          </div>
        )}

        {/* Monto límite */}
        <div className="space-y-1.5">
          <label htmlFor="pres-monto" className="block text-sm font-semibold text-on-surface">
            Monto límite{' '}
            <span className="font-normal text-on-surface-variant text-xs">(COP)</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm select-none pointer-events-none">
              $
            </span>
            <input
              id="pres-monto"
              ref={montoRef}
              name="monto_limite"
              type="number"
              inputMode="numeric"
              min="1"
              placeholder="0"
              value={form.monto_limite}
              onChange={onChange}
              disabled={cargando}
              className={`
                w-full pl-8 pr-4 py-3 rounded-xl border text-on-surface bg-surface-container-lowest
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                disabled:opacity-50 transition-colors text-sm
                ${getFieldError(errores, 'monto_limite')
                  ? 'border-error bg-error-container/10'
                  : 'border-outline-variant/40 hover:border-outline-variant'}
              `}
            />
          </div>
          {getFieldError(errores, 'monto_limite') ? (
            <p className="text-xs text-error flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 flex-shrink-0" />
              {getFieldError(errores, 'monto_limite')}
            </p>
          ) : form.monto_limite && Number(form.monto_limite) > 0 ? (
            <p className="text-xs text-on-surface-variant">
              Límite:{' '}
              <span className="font-semibold text-primary">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                }).format(parseFloat(form.monto_limite))}
              </span>
            </p>
          ) : null}
        </div>

        {/* Nota informativa al editar */}
        {editId && (
          <div className="flex gap-3 bg-surface-container rounded-xl px-4 py-3 border border-outline-variant/15">
            <PiggyBank className="w-4 h-4 text-on-surface-variant flex-shrink-0 mt-0.5" />
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Solo puedes modificar el monto límite. La categoría asignada no puede cambiarse.
            </p>
          </div>
        )}
      </div>

      {/* Pie con acciones */}
      <div className="flex-shrink-0 px-6 pb-8 sm:pb-6 pt-4 border-t border-outline-variant/15 flex gap-3">
        <button
          onClick={onClose}
          disabled={cargando}
          className="flex-1 py-3 rounded-xl border border-outline-variant text-on-surface font-semibold text-sm hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          disabled={cargando || hayErrores}
          className="flex-1 py-3 rounded-xl bg-primary text-on-primary font-semibold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
        >
          {cargando ? (
            <><Spinner size="sm" />{editId ? 'Guardando…' : 'Confirmando…'}</>
          ) : editId ? (
            'Guardar cambios'
          ) : (
            'Confirmar límite'
          )}
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   TARJETA DE PRESUPUESTO
═══════════════════════════════════════════════ */
function TarjetaPresupuesto({ p, onEditar, onEliminar }) {
  const cfg    = estadoConfig[p.estado] ?? estadoConfig.verde
  const pct    = Math.min(p.porcentaje, 100)
  const exceso = p.estado === 'rojo'
    ? Math.max(0, p.gastado - Number(p.monto_limite))
    : 0

  return (
    <div className="group bg-surface-container-lowest border border-outline-variant/15 rounded-2xl px-4 py-4 sm:px-5 sm:py-4 hover:border-outline-variant/40 transition-all">
      <div className="flex items-start gap-3 sm:gap-4">

        {/* Icono */}
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-2xl mt-0.5">
          {p.categorias?.icono || '🏷️'}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0 space-y-2.5">

          {/* Nombre + badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-on-surface text-sm">
              {p.categorias?.nombre || 'Categoría'}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
              {cfg.icon}
              {cfg.label}
            </span>
          </div>

          {/* Barra de progreso */}
          <div>
            <div className={`w-full h-1.5 rounded-full overflow-hidden ${cfg.track}`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-xs text-on-surface-variant">
                <span className="font-semibold text-on-surface">{formatMoneda(p.gastado)}</span>
                {' '}/ {formatMoneda(p.monto_limite)}
              </span>
              <span className="text-xs font-bold text-on-surface-variant">
                {Math.round(p.porcentaje)}%
              </span>
            </div>
          </div>

          {/* Disponible / Excedido */}
          {exceso > 0 ? (
            <p className="text-xs font-semibold text-rose-600">
              Excedido por {formatMoneda(exceso)}
            </p>
          ) : (
            <p className="text-xs text-on-surface-variant">
              Disponible:{' '}
              <span className="font-semibold text-on-surface">{formatMoneda(p.restante)}</span>
            </p>
          )}
        </div>

        {/* Acciones */}
        <div className="flex-shrink-0 flex flex-col gap-1.5 sm:flex-row sm:items-start sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEditar}
            className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer"
            aria-label="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onEliminar}
            className="p-2 rounded-xl bg-error-container/50 hover:bg-error-container text-error transition-colors cursor-pointer"
            aria-label="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   ESTADO VACÍO
═══════════════════════════════════════════════ */
function EstadoVacio({ onCrear }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
        <Wallet className="w-8 h-8 text-on-surface-variant" />
      </div>
      <div className="space-y-1">
        <h3 className="font-bold text-on-background text-lg">Sin presupuestos</h3>
        <p className="text-on-surface-variant text-sm max-w-xs">
          Asigna límites de gasto por categoría y mantén tus finanzas bajo control.
        </p>
      </div>
      <button
        onClick={onCrear}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-semibold text-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer shadow-sm"
      >
        <Plus className="w-4 h-4" />
        Agregar presupuesto
      </button>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   CHIP DE RESUMEN
═══════════════════════════════════════════════ */
function ResumenChip({ count, label, color }) {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber:   'bg-amber-50 text-amber-700 border-amber-200',
    rose:    'bg-rose-50 text-rose-700 border-rose-200',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold ${styles[color]}`}>
      <span className="text-sm font-extrabold tabular-nums">{count}</span>
      {label}
    </span>
  )
}