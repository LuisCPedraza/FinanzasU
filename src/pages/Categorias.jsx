import { useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  TrendingUp,
  Loader2,
  Tag,
  Lock
} from 'lucide-react'
import { useCategorias } from '../hooks/useCategorias'
import { validateCategoriaForm, hasErrors } from '../utils/validationHelpers'

const EMOJIS = [
  '🍔', '🛒', '🚌', '🏠', '💡', '📱', '🎓', '💊', '🎬', '🎮',
  '👕', '✈️', '💰', '💼', '📚', '🎵', '⚽', '🐾', '🎁', '☕',
  '🍕', '🚗', '💻', '🏋️', '🎨', '🛍️', '📦', '🔧', '🌐', '❤️'
]

const COLORES_REFERENCIA = [
  '#6366f1', '#24389c', '#3f51b5', '#006d36', '#83fba5',
  '#ba1a1a', '#7c2500', '#0ea5e9', '#8b5cf6', '#f59e0b'
]

const INITIAL_FORM = { nombre: '', tipo: 'gasto', icono: '🏷️', color: '#6366f1' }

const cx = (...classes) => classes.filter(Boolean).join(' ')

function UiButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  loading = false,
  ...props
}) {
  const variantMap = {
    primary:
      'bg-gradient-to-br from-[#24389c] to-[#3f51b5] text-white shadow-lg shadow-[#24389c]/20 hover:opacity-90',
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
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        variantMap[variant],
        sizeMap[size],
        className
      )}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

function UiCard({ children, className = '', padding = 'p-5' }) {
  return (
    <div
      className={cx(
        'rounded-2xl bg-white border border-[#c5c5d4]/20 shadow-sm animate-fade-in',
        padding,
        className
      )}
    >
      {children}
    </div>
  )
}

function UiInput({ label, icon: Icon, error, id, className = '', ...props }) {
  return (
    <div className={cx('space-y-2', className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-[#191c1d] ml-1">
          {label}
        </label>
      )}

      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757684] group-focus-within:text-[#24389c] transition-colors pointer-events-none" />
        )}

        <input
          id={id}
          {...props}
          className={cx(
            'w-full rounded-xl bg-white border text-[#191c1d] placeholder:text-[#757684]/50 transition-all duration-200',
            'focus:outline-none focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c]',
            Icon ? 'pl-12' : 'pl-4',
            'pr-4 py-3.5 text-sm',
            error ? 'border-[#ba1a1a]' : 'border-[#c5c5d4]/40'
          )}
        />
      </div>

      {error && <p className="text-xs text-[#ba1a1a] ml-1">{error}</p>}
    </div>
  )
}

function UiSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-[#c5c5d4] border-t-[#24389c] rounded-full animate-spin" />
    </div>
  )
}

function UiModal({ open, onClose, title, children, footer, size = 'md' }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    function onEsc(e) {
      if (e.key === 'Escape') onClose()
    }

    if (open) document.addEventListener('keydown', onEsc)

    return () => {
      document.removeEventListener('keydown', onEsc)
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  }

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
          'relative w-full max-h-[calc(100dvh-2rem)] bg-white rounded-2xl border border-[#c5c5d4]/30 shadow-2xl shadow-black/10 animate-scale-in overflow-hidden flex flex-col',
          sizes[size]
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#c5c5d4]/20 shrink-0">
          <h2 className="text-lg font-bold text-[#191c1d]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#757684] hover:text-[#191c1d] hover:bg-[#f3f4f5] transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-5 overflow-y-auto min-h-0 flex-1">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 p-5 border-t border-[#c5c5d4]/20 shrink-0 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Categorias() {
  const {
    categorias,
    cargandoDatos,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
  } = useCategorias()

  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const formRef = useRef(null)

  const predeterminadas = useMemo(
    () => categorias.filter((c) => c.es_predeterminada || !c.user_id),
    [categorias]
  )

  const personalizadas = useMemo(
    () => categorias.filter((c) => !c.es_predeterminada && c.user_id),
    [categorias]
  )

  const categoriasVisibles = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return personalizadas
    return personalizadas.filter((c) => c.nombre.toLowerCase().includes(term))
  }, [personalizadas, search])

  const totalCategorias = predeterminadas.length + personalizadas.length
  const totalGasto = personalizadas.filter((c) => c.tipo === 'gasto').length
  const totalIngreso = personalizadas.filter((c) => c.tipo === 'ingreso').length

  const obtenerEstado = (index) => {
    const opciones = [
      {
        label: 'Atencion',
        badge: 'bg-[#ffb59c]/40 text-[#7c2500]',
        barra: 'bg-[#7c2500]',
        porcentaje: 82
      },
      {
        label: 'Saludable',
        badge: 'bg-[#dee0ff] text-[#24389c]',
        barra: 'bg-[#24389c]',
        porcentaje: 45
      },
      {
        label: 'Saludable',
        badge: 'bg-[#83fba5] text-[#005227]',
        barra: 'bg-[#006d36]',
        porcentaje: 30
      },
      {
        label: 'En crecimiento',
        badge: 'bg-[#dee0ff] text-[#24389c]',
        barra: 'bg-[#006d36]',
        porcentaje: 65
      },
      {
        label: 'Revisar',
        badge: 'bg-[#ffdad6] text-[#ba1a1a]',
        barra: 'bg-[#7c2500]',
        porcentaje: 95
      }
    ]

    return opciones[index % opciones.length]
  }

  const openCreate = () => {
    setEditando(null)
    setForm(INITIAL_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (categoria) => {
    setEditando(categoria)
    setForm({
      nombre: categoria.nombre,
      tipo: categoria.tipo,
      icono: categoria.icono || '🏷️',
      color: categoria.color || '#6366f1'
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
    setErrors(validateCategoriaForm(next))
  }

  const handleSubmit = async (e) => {
    e?.preventDefault?.()

    const nextErrors = validateCategoriaForm(form)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setSaving(true)
    try {
      const payload = {
        nombre: form.nombre.trim(),
        tipo: form.tipo,
        icono: form.icono,
        color: form.color
      }

      if (editando) {
        await actualizarCategoria(editando.id, payload)
        toast.success('Categoria actualizada')
      } else {
        await crearCategoria(payload)
        toast.success('Categoria creada')
      }

      setSearch('')
      closeModal()
    } catch (err) {
      toast.error(err?.message || 'Error al guardar categoria')
    } finally {
      setSaving(false)
    }
  }

  const confirmarEliminacion = async () => {
    if (!deleteModal) return

    try {
      setDeleting(true)
      await eliminarCategoria(deleteModal)
      toast.success('Categoria eliminada')
      setDeleteModal(null)
    } catch (err) {
      toast.error(err?.message || 'Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  const disableSubmit = hasErrors(errors) || saving || !form.nombre.trim()

  const submitFromFooter = () => {
    if (formRef.current?.requestSubmit) {
      formRef.current.requestSubmit()
      return
    }

    handleSubmit()
  }

  if (cargandoDatos) return <UiSpinner />

  return (
    <div className="space-y-10 animate-fade-in pb-16 bg-[#f8f9fa] min-h-screen text-[#191c1d]">
      <div className="sticky top-4 z-20 flex items-center justify-between gap-4 bg-white/90 backdrop-blur-md border border-[#c5c5d4]/20 rounded-2xl px-4 py-3">
        <h2 className="text-[#24389c] text-2xl font-bold tracking-tight flex items-center gap-2">
          <Tag className="w-6 h-6" />
          Categorias
        </h2>

        <div className="flex items-center gap-4">
          <div className="relative group hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#757684] group-focus-within:text-[#24389c] transition-colors" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar categorias..."
              className="pl-10 pr-4 py-2 bg-[#f3f4f5] border border-[#c5c5d4]/40 rounded-full text-sm focus:ring-2 focus:ring-[#24389c] w-64 transition-all outline-none"
            />
          </div>

          <UiButton onClick={openCreate}>
            <Plus className="w-4 h-4" />
            Agregar categoria
          </UiButton>
        </div>
      </div>

      <section className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-[#24389c] rounded-3xl p-10 text-white relative overflow-hidden flex flex-col justify-between min-h-[280px]">
          <div className="relative z-10">
            <p className="font-bold text-white/60 tracking-wider uppercase text-xs mb-2">
              Panorama de categorias
            </p>
            <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">Enfoque en crecimiento</h3>
            <p className="max-w-md text-white/85 leading-relaxed">
              Tus categorias personalizadas te ayudan a visualizar como distribuyes tu dinero y donde puedes optimizar.
            </p>
          </div>

          <div className="mt-8 flex gap-8 z-10 flex-wrap">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                Total categorias
              </p>
              <p className="text-2xl font-extrabold">{totalCategorias}</p>
            </div>

            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                Personalizadas
              </p>
              <p className="text-2xl font-extrabold">{personalizadas.length}</p>
            </div>

            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                Balance
              </p>
              <p className="text-2xl font-extrabold">{totalIngreso}/{totalGasto}</p>
            </div>
          </div>

          <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 pointer-events-none">
            <img
              alt="Resumen visual"
              className="object-cover h-full w-full grayscale contrast-125"
              src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop"
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-[#83fba5] rounded-3xl p-8 flex flex-col justify-center border border-[#006d36]/15">
          <div className="mb-6">
            <TrendingUp className="text-[#005227] w-10 h-10 mb-4" />
            <h4 className="text-[#005227] text-xl font-bold">Sugerencia de optimizacion</h4>
          </div>

          <p className="text-[#005227]/85 text-sm leading-relaxed mb-6">
            Revisa categorias con poco uso para simplificar tu panel y mantener foco en los rubros que realmente impactan tus finanzas.
          </p>

          <button
            type="button"
            className="bg-[#006d36] text-white py-3 px-6 rounded-xl font-bold text-sm self-start hover:opacity-90 transition-opacity"
          >
            Ajustar estrategia
          </button>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-end gap-4">
          <div>
            <h3 className="text-2xl font-extrabold text-[#24389c]">Insights por categoria</h3>
            <p className="text-[#454652] text-sm mt-1">
              Desglose en tiempo real de tu estrategia de asignacion.
            </p>
          </div>

          <div className="flex gap-3">
            <span className="px-4 py-2 rounded-full bg-white text-[#191c1d] text-xs font-bold border border-[#c5c5d4]/30">
              Activas
            </span>
            <span className="px-4 py-2 rounded-full text-[#757684] text-xs font-bold">Archivadas</span>
          </div>
        </div>

        {categoriasVisibles.length === 0 ? (
          <UiCard padding="p-10" className="text-center">
            <p className="font-semibold text-lg">No hay categorias para mostrar</p>
            <p className="text-[#454652] text-sm mt-1">
              Crea una categoria personalizada o cambia el termino de busqueda.
            </p>
          </UiCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categoriasVisibles.map((categoria, idx) => {
              const estado = obtenerEstado(idx)
              const usado = Math.round((estado.porcentaje / 100) * 500)

              return (
                <UiCard
                  key={categoria.id}
                  padding="p-6"
                  className="group hover:bg-[#f3f4f5] transition-all duration-300 rounded-3xl relative"
                >
                  <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => openEdit(categoria)}
                      className="p-1.5 rounded-lg bg-white hover:bg-[#edeeef] text-[#454652] cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteModal(categoria.id)}
                      className="p-1.5 rounded-lg bg-[#ffdad6] hover:bg-[#ffdad6]/70 text-[#ba1a1a] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-start mb-8">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                      style={{ backgroundColor: `${categoria.color || '#24389c'}25` }}
                    >
                      {categoria.icono || '🏷️'}
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-[#757684] uppercase tracking-widest mb-1">
                        Estado
                      </p>
                      <span className={cx('text-xs font-bold px-2 py-1 rounded', estado.badge)}>
                        {estado.label}
                      </span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-[#191c1d] truncate">{categoria.nombre}</h4>
                    <p className="text-[#454652] text-sm">
                      {categoria.tipo === 'gasto' ? 'Categoria de egresos' : 'Categoria de ingresos'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#454652]">{estado.porcentaje}% de referencia</span>
                      <span className="font-bold text-[#191c1d]">${usado.toLocaleString('es-CO')}</span>
                    </div>

                    <div className="h-3 w-full bg-[#e1e3e4] rounded-full overflow-hidden">
                      <div
                        className={cx('h-full rounded-full', estado.barra)}
                        style={{ width: `${estado.porcentaje}%` }}
                      />
                    </div>
                  </div>
                </UiCard>
              )
            })}
          </div>
        )}
      </section>

      {predeterminadas.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-[#191c1d] mb-4">Categorias base del sistema</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {predeterminadas.map((categoria) => (
              <UiCard
                key={categoria.id}
                padding="p-4"
                className="text-center opacity-90 shadow-none border-dashed border-2 rounded-2xl"
              >
                <span className="text-3xl block mb-2 grayscale opacity-80">{categoria.icono || '🏷️'}</span>
                <p className="text-sm font-bold text-[#191c1d] truncate">{categoria.nombre}</p>
                <span
                  className={cx(
                    'text-[10px] font-bold uppercase tracking-widest mt-1 block',
                    categoria.tipo === 'ingreso' ? 'text-[#006d36]' : 'text-[#7c2500]'
                  )}
                >
                  {categoria.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                </span>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#757684]">
                  <Lock className="w-3 h-3" /> Predeterminada
                </span>
              </UiCard>
            ))}
          </div>
        </section>
      )}

      <div className="fixed bottom-8 right-8 z-40 md:hidden">
        <button
          type="button"
          onClick={openCreate}
          className="w-14 h-14 bg-[#24389c] text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <UiModal
        open={modalOpen}
        onClose={closeModal}
        title={editando ? 'Editar categoria' : 'Nueva categoria'}
        size="md"
        footer={
          <>
            <UiButton variant="ghost" onClick={closeModal}>
              Cancelar
            </UiButton>
            <UiButton type="button" onClick={submitFromFooter} loading={saving} disabled={disableSubmit}>
              {editando ? 'Guardar cambios' : 'Crear categoria'}
            </UiButton>
          </>
        }
      >
        <form ref={formRef} id="form-categoria" onSubmit={handleSubmit} className="space-y-6">
          <UiInput
            id="cat-nombre"
            icon={Tag}
            label="Nombre de la categoria"
            placeholder="Ej. Suscripciones"
            value={form.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            error={errors.nombre}
          />

          <div className="space-y-2">
            <span className="block text-sm font-semibold text-[#191c1d] ml-1">Tipo</span>
            <div className="flex gap-3 bg-[#edeeef] p-1.5 rounded-xl">
              {['gasto', 'ingreso'].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => handleChange('tipo', tipo)}
                  className={cx(
                    'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer',
                    form.tipo === tipo
                      ? tipo === 'ingreso'
                        ? 'bg-[#006d36] text-white'
                        : 'bg-[#ba1a1a] text-white'
                      : 'bg-transparent text-[#454652]'
                  )}
                >
                  {tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                </button>
              ))}
            </div>
            {errors.tipo && <p className="text-xs text-[#ba1a1a] ml-1">{errors.tipo}</p>}
          </div>

          <div>
            <p className="block text-sm font-semibold text-[#191c1d] ml-1 mb-3">Icono</p>
            <div className="grid grid-cols-6 gap-2 bg-white border border-[#c5c5d4]/30 p-3 rounded-xl">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleChange('icono', emoji)}
                  className={cx(
                    'p-2 rounded-xl text-2xl hover:bg-[#f3f4f5] transition-all cursor-pointer transform hover:scale-110',
                    form.icono === emoji && 'bg-[#dee0ff] ring-2 ring-[#24389c] ring-offset-1'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="block text-sm font-semibold text-[#191c1d] ml-1 mb-3">Color de referencia</p>
            <div className="flex flex-wrap gap-2">
              {COLORES_REFERENCIA.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('color', color)}
                  aria-label={`Seleccionar color ${color}`}
                  className={cx(
                    'w-8 h-8 rounded-lg border transition-all',
                    form.color === color
                      ? 'ring-2 ring-[#24389c] ring-offset-1 border-[#24389c]'
                      : 'border-[#c5c5d4]/50 hover:scale-105'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </form>
      </UiModal>

      <UiModal
        open={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Confirmar eliminacion"
        size="sm"
        footer={
          <>
            <UiButton variant="ghost" onClick={() => setDeleteModal(null)}>
              Cancelar
            </UiButton>
            <UiButton variant="danger" loading={deleting} onClick={confirmarEliminacion}>
              Eliminar categoria
            </UiButton>
          </>
        }
      >
        <p className="text-[#454652] font-medium">
          Seguro que deseas eliminar esta categoria? Las transacciones que la usan quedaran sin asignar.
        </p>
      </UiModal>
    </div>
  )
}