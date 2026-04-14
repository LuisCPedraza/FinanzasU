import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Plus,
  Trash2,
  Pencil,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  Bolt,
  ArrowRight,
  AlertTriangle,
  CircleCheckBig,
  BarChart3,
  X,
  Loader2
} from 'lucide-react'
import { usePresupuestos } from '../hooks/usePresupuestos'
import { useCategorias } from '../hooks/useCategorias'
import { formatMoneda } from '../utils/formatMoneda'
import { MESES } from '../utils/constants'
import { validatePresupuestoForm, hasErrors } from '../utils/validationHelpers'

const HOY = new Date()
const INITIAL_FORM = { categoria_id: '', monto_limite: '' }

const cx = (...classes) => classes.filter(Boolean).join(' ')

function UiButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  ...props
}) {
  const variantMap = {
    primary: 'editorial-gradient text-white shadow-lg shadow-[#24389c]/20 hover:opacity-90',
    ghost: 'bg-transparent text-[#454652] hover:bg-[#edeeef]',
    danger: 'bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/20 hover:bg-[#ba1a1a] hover:text-white'
  }

  const sizeMap = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        variantMap[variant],
        sizeMap[size],
        className
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </button>
  )
}

function UiCard({ children, className = '', padding = 'p-6' }) {
  return (
    <div className={cx('bg-white border border-[#c5c5d4]/20 rounded-2xl shadow-sm animate-fade-in', padding, className)}>
      {children}
    </div>
  )
}

function UiInput({ label, id, className = '', ...props }) {
  return (
    <div className={cx('space-y-2', className)}>
      {label ? <label htmlFor={id} className="block text-sm font-semibold text-[#191c1d] ml-1">{label}</label> : null}
      <input
        id={id}
        {...props}
        className={cx(
          'w-full rounded-xl border border-[#c5c5d4]/40 bg-white px-4 py-3.5 text-sm text-[#191c1d]',
          'placeholder:text-[#757684]/60 focus:outline-none focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c]'
        )}
      />
    </div>
  )
}

function UiSelect({ label, id, options, className = '', ...props }) {
  return (
    <div className={cx('space-y-2', className)}>
      {label ? <label htmlFor={id} className="block text-sm font-semibold text-[#191c1d] ml-1">{label}</label> : null}
      <select
        id={id}
        {...props}
        className={cx(
          'w-full rounded-xl border border-[#c5c5d4]/40 bg-white px-4 py-3.5 text-sm text-[#191c1d]',
          'focus:outline-none focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c]'
        )}
      >
        <option value="">Seleccionar...</option>
        {options.map((opt) => (
          <option value={opt.value} key={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

function AlertBadge({ estado, label, pulse = false }) {
  const map = {
    verde: 'bg-[#006d36]/10 border-[#006d36]/30 text-[#006d36]',
    amarillo: 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#b45309]',
    rojo: 'bg-[#ba1a1a]/10 border-[#ba1a1a]/30 text-[#ba1a1a]'
  }

  return (
    <span className={cx('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border', map[estado])}>
      <span
        className={cx(
          'w-1.5 h-1.5 rounded-full',
          estado === 'verde' ? 'bg-[#006d36]' : estado === 'amarillo' ? 'bg-[#f59e0b]' : 'bg-[#ba1a1a]',
          pulse && 'animate-pulse-soft'
        )}
      />
      {label}
    </span>
  )
}

function EmptyState({ title, description, onAction }) {
  return (
    <UiCard padding="p-10" className="text-center">
      <div className="w-14 h-14 rounded-2xl bg-[#edeeef] flex items-center justify-center mx-auto mb-4">
        <PiggyBank className="w-7 h-7 text-[#757684]" />
      </div>
      <h4 className="text-lg font-bold text-[#191c1d] mb-1">{title}</h4>
      <p className="text-sm text-[#454652] mb-6">{description}</p>
      <UiButton onClick={onAction}>Asignar un limite</UiButton>
    </UiCard>
  )
}

function UiModal({ open, onClose, title, children, footer, size = 'md' }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const onEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('keydown', onEsc)
    }
  }, [open, onClose])

  if (!open) return null

  const sizeMap = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto animate-fade-in"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/35 backdrop-blur-sm" />
      <div
        className={cx(
          'relative w-full max-h-[calc(100dvh-2rem)] bg-white rounded-2xl border border-[#c5c5d4]/30 shadow-2xl animate-scale-in overflow-hidden flex flex-col',
          sizeMap[size]
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#c5c5d4]/20 shrink-0">
          <h2 className="text-lg font-bold text-[#191c1d]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#edeeef] text-[#757684] hover:text-[#191c1d] transition-colors"
          >
            <X className="w-4 h-4 mx-auto" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto min-h-0 flex-1">{children}</div>

        {footer ? <div className="flex justify-end gap-3 p-5 border-t border-[#c5c5d4]/20 shrink-0 bg-white">{footer}</div> : null}
      </div>
    </div>
  )
}

export default function Presupuestos() {
  const [mes, setMes] = useState(HOY.getMonth() + 1)
  const [anio, setAnio] = useState(HOY.getFullYear())

  const { presupuestos, loading, resumen, crear, actualizar, eliminar } = usePresupuestos(mes, anio)
  const { categorias } = useCategorias()

  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const formRef = useRef(null)

  const categoriasGasto = useMemo(
    () => categorias.filter((c) => c.tipo === 'gasto'),
    [categorias]
  )

  const categoriasOpciones = useMemo(
    () => categoriasGasto.map((c) => ({ value: String(c.id), label: `${c.icono || '🏷️'} ${c.nombre}` })),
    [categoriasGasto]
  )

  const totalGastado = useMemo(
    () => presupuestos.reduce((acc, p) => acc + Number(p.gastado || 0), 0),
    [presupuestos]
  )

  const totalLimite = useMemo(
    () => presupuestos.reduce((acc, p) => acc + Number(p.monto_limite || 0), 0),
    [presupuestos]
  )

  const porcentajeGlobal = totalLimite > 0 ? Math.min((totalGastado / totalLimite) * 100, 100) : 0
  const disponibles = Math.max(totalLimite - totalGastado, 0)
  const proyeccion = totalLimite - totalGastado
  const eficiencia = totalLimite > 0 ? Math.max(0, Math.round((1 - totalGastado / totalLimite) * 100)) : 100

  const categoriaAlerta = useMemo(
    () => presupuestos.find((p) => p.estado === 'rojo') || presupuestos.find((p) => p.estado === 'amarillo'),
    [presupuestos]
  )

  const categoriaSana = useMemo(
    () => presupuestos.find((p) => p.estado === 'verde'),
    [presupuestos]
  )

  const cambiarMes = (delta) => {
    let m = mes + delta
    let a = anio
    if (m > 12) {
      m = 1
      a += 1
    }
    if (m < 1) {
      m = 12
      a -= 1
    }
    setMes(m)
    setAnio(a)
  }

  const openCreate = () => {
    setEditando(null)
    setForm(INITIAL_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (presupuesto) => {
    setEditando(presupuesto)
    setForm({
      categoria_id: String(presupuesto.categoria_id),
      monto_limite: String(presupuesto.monto_limite)
    })
    setErrors({})
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditando(null)
    setErrors({})
  }

  const handleChange = (field, value) => {
    const next = { ...form, [field]: value }
    setForm(next)
    setErrors(validatePresupuestoForm(next))
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.()

    const nextErrors = validatePresupuestoForm(form)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setSaving(true)
    try {
      const payload = {
        categoria_id: Number(form.categoria_id),
        monto_limite: Number(form.monto_limite)
      }

      if (editando) {
        await actualizar(editando.id, payload)
        toast.success('Presupuesto actualizado')
      } else {
        await crear(payload)
        toast.success('Presupuesto creado')
      }

      closeModal()
    } catch (err) {
      toast.error(err?.message || 'Error al guardar presupuesto')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await eliminar(id)
      toast.success('Presupuesto eliminado')
    } catch (err) {
      toast.error(err?.message || 'Error al eliminar')
    }
  }

  const submitFromFooter = () => {
    if (formRef.current?.requestSubmit) {
      formRef.current.requestSubmit()
      return
    }
    handleSubmit()
  }

  const disableSubmit = hasErrors(errors) || saving

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#24389c]" />
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-fade-in pb-24 bg-[#f8f9fa] min-h-screen text-[#191c1d]">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-[#24389c] to-[#3f51b5] p-8 rounded-3xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[#dee0ff] text-sm font-semibold mb-2 uppercase tracking-widest">Estado mensual</p>
            <h3 className="font-headline text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
              {resumen.rojo > 0
                ? 'Tienes categorias que requieren ajuste inmediato'
                : resumen.amarillo > 0
                  ? 'Vas bien, pero algunas categorias estan cerca del limite'
                  : 'Excelente control, tus gastos estan saludables'}
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl md:text-5xl font-extrabold tracking-tighter">{formatMoneda(disponibles)}</span>
              <span className="text-[#dee0ff] mb-1 font-medium">disponibles</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-15 translate-x-1/4 translate-y-1/4">
            <BarChart3 className="w-52 h-52" />
          </div>
        </div>

        <div className="bg-[#83fba5] p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <PiggyBank className="w-9 h-9 text-[#005227] p-1.5 bg-white/45 rounded-lg" />
              <span className="text-xs font-bold text-[#005227] bg-white/45 px-2 py-1 rounded-full">
                {formatMoneda(proyeccion)}
              </span>
            </div>
            <h4 className="text-[#005227] font-bold text-lg leading-tight">Meta: ahorro mensual</h4>
            <p className="text-[#005227]/75 text-sm mt-1">Progreso de ahorro</p>
          </div>
          <div className="mt-6">
            <div className="w-full h-2 bg-[#005227]/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#006d36] rounded-full transition-all duration-500"
                style={{ width: `${Math.max(0, 100 - porcentajeGlobal)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs font-bold text-[#005227]">{Math.max(0, 100 - Math.round(porcentajeGlobal))}% libre</span>
              <span className="text-xs font-medium text-[#005227]/70">{formatMoneda(totalLimite)} meta</span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6 gap-3">
          <h3 className="font-headline text-2xl font-bold">Alertas activas</h3>
          <button type="button" className="text-[#24389c] font-bold text-sm hover:underline flex items-center gap-1">
            Configurar alertas <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#ffdbcf] border-l-4 border-[#7c2500] p-4 rounded-r-xl flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-[#7c2500]" />
            <div className="flex-1">
              <p className="text-[#7c2500] text-xs font-bold uppercase tracking-wider">Limite cercano</p>
              <p className="text-[#402000] font-semibold">
                {categoriaAlerta
                  ? `Has consumido ${Math.round(categoriaAlerta.porcentaje)}% en "${categoriaAlerta.categorias?.nombre || 'Categoria'}".`
                  : 'No hay categorias en zona de riesgo por ahora.'}
              </p>
            </div>
            <button type="button" className="text-[#7c2500] font-bold text-xs uppercase tracking-widest px-4 py-2 bg-white/50 rounded-full">
              Revisar
            </button>
          </div>

          <div className="bg-[#f3f4f5] p-4 rounded-xl flex items-center gap-4 border border-[#c5c5d4]/20">
            <CircleCheckBig className="w-8 h-8 text-[#006d36]" />
            <div className="flex-1">
              <p className="text-[#006d36] text-xs font-bold uppercase tracking-wider">Buen trabajo</p>
              <p className="font-semibold">
                {categoriaSana
                  ? `"${categoriaSana.categorias?.nombre || 'Categoria'}" esta bajo control con ${Math.round(categoriaSana.porcentaje)}% consumido.`
                  : 'Aun no hay datos suficientes para destacar una categoria saludable.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
          <div>
            <h3 className="font-headline text-2xl font-bold">Presupuestos por categoria</h3>
            <p className="text-[#454652] text-sm mt-1">Planificacion mensual para {MESES[mes - 1]} {anio}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#c5c5d4]/30 w-fit">
              <button type="button" onClick={() => cambiarMes(-1)} className="p-1.5 rounded-lg hover:bg-[#edeeef] text-[#454652]">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold font-headline text-[#24389c] min-w-[130px] text-center">
                {MESES[mes - 1]} {anio}
              </span>
              <button type="button" onClick={() => cambiarMes(1)} className="p-1.5 rounded-lg hover:bg-[#edeeef] text-[#454652]">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <UiButton onClick={openCreate} icon={Plus}>Nuevo presupuesto</UiButton>
          </div>
        </div>

        {presupuestos.length === 0 ? (
          <EmptyState
            title="Sin presupuestos asignados"
            description="Define cuanto quieres gastar maximo cada mes por categoria."
            onAction={openCreate}
          />
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              <AlertBadge estado="verde" label={`${resumen.verde} sanos`} />
              <AlertBadge estado="amarillo" label={`${resumen.amarillo} alertas`} pulse={resumen.amarillo > 0} />
              <AlertBadge estado="rojo" label={`${resumen.rojo} excedidos`} pulse={resumen.rojo > 0} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presupuestos.map((p) => {
                const bgEstado = p.estado === 'rojo' ? 'bg-[#ffdbcf]' : p.estado === 'amarillo' ? 'bg-[#dee0ff]' : 'bg-[#83fba5]'
                const textEstado = p.estado === 'rojo' ? 'text-[#7c2500]' : p.estado === 'amarillo' ? 'text-[#24389c]' : 'text-[#006d36]'
                const barTrack = p.estado === 'rojo' ? 'bg-[#ffdad6]' : p.estado === 'amarillo' ? 'bg-[#dee0ff]' : 'bg-[#83fba5]/40'
                const barFill = p.estado === 'rojo' ? 'bg-[#7c2500]' : p.estado === 'amarillo' ? 'bg-[#24389c]' : 'bg-[#006d36]'

                return (
                  <UiCard key={p.id} className="group hover:shadow-xl transition-shadow duration-300 relative">
                    <div className="flex justify-between items-start mb-6">
                      <div className={cx('p-3 rounded-xl', bgEstado)}>
                        <span className={cx('text-2xl', textEstado)}>{p.categorias?.icono || '🏷️'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => openEdit(p)} className="text-[#757684] hover:text-[#191c1d] transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" onClick={() => handleDelete(p.id)} className="text-[#757684] hover:text-[#ba1a1a] transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-lg mb-1">{p.categorias?.nombre || 'Categoria'}</h4>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-2xl font-extrabold">{formatMoneda(p.gastado || 0)}</span>
                      <span className="text-[#757684] text-sm">/ {formatMoneda(p.monto_limite)} mes</span>
                    </div>

                    <div className="relative pt-1">
                      <div className={cx('overflow-hidden h-3 mb-4 text-xs flex rounded-full', barTrack)}>
                        <div className={cx('flex rounded-full transition-all duration-500', barFill)} style={{ width: `${Math.min(p.porcentaje || 0, 100)}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={cx('font-bold', textEstado)}>
                          {p.estado === 'rojo' ? 'Limite alcanzado' : `${Math.round(p.porcentaje || 0)}% consumido`}
                        </span>
                        <span className="text-[#454652] font-medium">{formatMoneda(p.restante || 0)} restantes</span>
                      </div>
                    </div>
                  </UiCard>
                )
              })}

              <div
                onClick={openCreate}
                className="border-2 border-dashed border-[#c5c5d4]/45 p-6 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#edeeef] transition-colors group"
              >
                <div className="w-12 h-12 bg-[#edeeef] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-[#757684]" />
                </div>
                <p className="font-bold text-[#454652]">Anadir nuevo presupuesto</p>
                <p className="text-xs text-[#757684] mt-1">Organiza tus gastos a medida</p>
              </div>

              <div className="bg-[#2e3132] p-6 rounded-2xl text-[#f0f1f2]">
                <h4 className="font-headline font-bold text-lg mb-4">Analisis de ahorro</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#f0f1f2]/70 text-sm">Proyeccion final</span>
                    <span className="text-[#83fba5] font-bold">{formatMoneda(proyeccion)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#f0f1f2]/70 text-sm">Eficiencia de gasto</span>
                    <span className="text-[#dee0ff] font-bold">{eficiencia}%</span>
                  </div>
                </div>
                <div className="mt-8">
                  <button type="button" className="w-full py-2 bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors">
                    Ver reporte detallado
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <div className="fixed bottom-8 right-8 z-30 hidden md:flex">
        <button
          type="button"
          onClick={openCreate}
          className="w-16 h-16 bg-gradient-to-br from-[#24389c] to-[#3f51b5] text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
        >
          <Bolt className="w-7 h-7" />
        </button>
      </div>

      <UiModal
        open={modalOpen}
        onClose={closeModal}
        title={editando ? 'Editar limite' : 'Asignar presupuesto'}
        size="md"
        footer={
          <>
            <UiButton variant="ghost" onClick={closeModal}>Cancelar</UiButton>
            <UiButton onClick={submitFromFooter} loading={saving}>
              {editando ? 'Guardar' : 'Confirmar'}
            </UiButton>
          </>
        }
      >
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <UiSelect
            id="pres-cat"
            label="Selecciona la categoria"
            options={categoriasOpciones}
            value={form.categoria_id}
            onChange={(e) => handleChange('categoria_id', e.target.value)}
          />
          {errors.categoria_id ? <p className="text-xs text-[#ba1a1a] -mt-3 ml-1">{errors.categoria_id}</p> : null}

          <UiInput
            id="pres-monto"
            label="Cual es tu limite? (COP)"
            type="number"
            min={0}
            step={1000}
            placeholder="Ej. 100000"
            value={form.monto_limite}
            onChange={(e) => handleChange('monto_limite', e.target.value)}
          />
          {errors.monto_limite ? <p className="text-xs text-[#ba1a1a] -mt-3 ml-1">{errors.monto_limite}</p> : null}

          <p className="text-xs text-[#757684] bg-[#f3f4f5] rounded-xl p-3">
            Este presupuesto aplica para <strong>{MESES[mes - 1]} {anio}</strong>
          </p>
        </form>
      </UiModal>
    </div>
  )
}