import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { usePresupuestos } from '../hooks/usePresupuestos'
import { useCategorias } from '../hooks/useCategorias'
import Modal from '../components/ui/Modal'
import { formatMoneda } from '../utils/formatMoneda'
import { MESES } from '../utils/constants'
import { validatePresupuestoForm, hasErrors } from '../utils/validationHelpers'

const hoy = new Date()
const INITIAL_FORM = { categoria_id: '', monto_limite: '' }

export default function Presupuestos() {
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [anio, setAnio] = useState(hoy.getFullYear())

  const { presupuestos, loading, resumen, crear, actualizar, eliminar } = usePresupuestos(mes, anio)
  const { categorias } = useCategorias()

  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const categoriasGasto = useMemo(
    () => categorias.filter((c) => c.tipo === 'gasto'),
    [categorias]
  )

  const prevMonth = () => {
    if (mes === 1) { setMes(12); setAnio((a) => a - 1) }
    else setMes((m) => m - 1)
  }

  const nextMonth = () => {
    if (mes === 12) { setMes(1); setAnio((a) => a + 1) }
    else setMes((m) => m + 1)
  }

  const openCreate = () => {
    setEditando(null)
    setForm(INITIAL_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (p) => {
    setEditando(p)
    setForm({
      categoria_id: String(p.categoria_id),
      monto_limite: String(p.monto_limite)
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
    e.preventDefault()
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

  const estadoColor = {
    verde: { bg: 'bg-[#83fba5]/30', bar: 'bg-[#006d36]', text: 'text-[#006d36]' },
    amarillo: { bg: 'bg-[#fff3cd]', bar: 'bg-[#b8860b]', text: 'text-[#b8860b]' },
    rojo: { bg: 'bg-[#ffdad6]/50', bar: 'bg-[#93000a]', text: 'text-[#93000a]' }
  }

  const disableSubmit = hasErrors(errors) || saving

  return (
    <div className="space-y-6 animate-[fadeIn_.35s_ease-out] pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#24389c] tracking-tight flex items-center gap-2">
            <Sparkles className="w-7 h-7" /> Presupuestos
          </h1>
          <p className="text-sm text-[#454652] mt-1">Controla tus limites de gasto mensuales</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#24389c] to-[#3f51b5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#24389c]/20 hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> Agregar presupuesto
        </button>
      </div>

      {/* Navegador de mes */}
      <div className="flex items-center justify-center gap-4 bg-white rounded-2xl border border-[#c5c5d4]/30 p-3 shadow-sm">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-[#dee0ff] text-[#24389c] transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-bold text-[#191c1d] min-w-[160px] text-center">
          {MESES[mes - 1]} {anio}
        </span>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-[#dee0ff] text-[#24389c] transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#83fba5]/20 rounded-2xl p-4 text-center border border-[#006d36]/10">
          <p className="text-2xl font-black text-[#006d36]">{resumen.verde}</p>
          <p className="text-[10px] font-bold text-[#006d36]/70 uppercase tracking-widest">En rango</p>
        </div>
        <div className="bg-[#fff3cd]/50 rounded-2xl p-4 text-center border border-[#b8860b]/10">
          <p className="text-2xl font-black text-[#b8860b]">{resumen.amarillo}</p>
          <p className="text-[10px] font-bold text-[#b8860b]/70 uppercase tracking-widest">Precaucion</p>
        </div>
        <div className="bg-[#ffdad6]/30 rounded-2xl p-4 text-center border border-[#93000a]/10">
          <p className="text-2xl font-black text-[#93000a]">{resumen.rojo}</p>
          <p className="text-[10px] font-bold text-[#93000a]/70 uppercase tracking-widest">Excedido</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#24389c] border-t-transparent" />
        </div>
      ) : presupuestos.length === 0 ? (
        <div className="text-center py-20 text-[#757684]">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-semibold">No hay presupuestos para este mes</p>
          <p className="text-sm">Crea uno para controlar tus gastos</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {presupuestos.map((p) => {
            const colors = estadoColor[p.estado] || estadoColor.verde
            const catNombre = p.categorias?.nombre || 'Categoria'
            const catIcono = p.categorias?.icono || '📦'
            const pct = Math.min(p.porcentaje || 0, 100)

            return (
              <div
                key={p.id}
                className={['rounded-2xl border border-[#c5c5d4]/30 p-5 shadow-sm hover:shadow-md transition-shadow', colors.bg].join(' ')}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl">{catIcono}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#191c1d] truncate">{catNombre}</p>
                      <p className={['text-xs font-semibold', colors.text].join(' ')}>
                        {p.porcentaje}% usado
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg text-[#454652] hover:bg-white/60 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg text-[#454652] hover:bg-white/60 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-white/60 rounded-full overflow-hidden mb-2">
                  <div
                    className={['h-full rounded-full transition-all duration-500', colors.bar].join(' ')}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-[#454652]">Gastado: <span className="font-bold">{formatMoneda(p.gastado || 0)}</span></span>
                  <span className="text-[#454652]">Limite: <span className="font-bold">{formatMoneda(p.monto_limite)}</span></span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editando ? 'Editar presupuesto' : 'Nuevo presupuesto'}
        size="md"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-semibold text-[#454652] hover:bg-[#edeeef] rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="form-presupuesto"
              disabled={disableSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#24389c] to-[#3f51b5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#24389c]/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Guardar'}
            </button>
          </>
        }
      >
        <form id="form-presupuesto" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pres-cat" className="block text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">Categoria de gasto</label>
            <select
              id="pres-cat"
              value={form.categoria_id}
              onChange={(e) => handleChange('categoria_id', e.target.value)}
              className={[
                'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#191c1d]',
                'focus:outline-none focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all',
                errors.categoria_id ? 'border-[#ba1a1a]' : 'border-[#c5c5d4]/40'
              ].join(' ')}
            >
              <option value="">Selecciona una categoria</option>
              {categoriasGasto.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icono || ''} {c.nombre}
                </option>
              ))}
            </select>
            {errors.categoria_id && <p className="text-xs text-[#ba1a1a] mt-1">{errors.categoria_id}</p>}
          </div>

          <div>
            <label htmlFor="pres-monto" className="block text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">Monto limite</label>
            <input
              id="pres-monto"
              type="number"
              step="any"
              min="0"
              placeholder="0"
              value={form.monto_limite}
              onChange={(e) => handleChange('monto_limite', e.target.value)}
              className={[
                'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#191c1d] placeholder:text-[#757684]/50',
                'focus:outline-none focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all',
                errors.monto_limite ? 'border-[#ba1a1a]' : 'border-[#c5c5d4]/40'
              ].join(' ')}
            />
            {errors.monto_limite && <p className="text-xs text-[#ba1a1a] mt-1">{errors.monto_limite}</p>}
          </div>

          <p className="text-xs text-[#757684] bg-[#f3f4f5] rounded-xl p-3">
            Este presupuesto aplica para <strong>{MESES[mes - 1]} {anio}</strong>
          </p>
        </form>
      </Modal>
    </div>
  )
}
