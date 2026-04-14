import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  Plus,
  Pencil,
  Trash2,
  ReceiptText,
  ArrowUpCircle,
  ArrowDownCircle
} from 'lucide-react'
import { useTransacciones } from '../hooks/useTransacciones'
import { useCategorias } from '../hooks/useCategorias'
import Modal from '../components/ui/Modal'
import { formatMoneda } from '../utils/formatMoneda'
import { validateTransaccionForm, hasErrors } from '../utils/validationHelpers'

const INITIAL_FORM = {
  tipo: 'gasto',
  monto: '',
  descripcion: '',
  categoria_id: '',
  fecha: new Date().toISOString().split('T')[0]
}

export default function Transacciones() {
  const {
    transacciones,
    cargandoDatos,
    crearTransaccion,
    actualizarTransaccion,
    eliminarTransaccion
  } = useTransacciones()
  const { categorias } = useCategorias()

  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const categoriasFiltradas = useMemo(
    () => categorias.filter((c) => c.tipo === form.tipo),
    [categorias, form.tipo]
  )

  const openCreate = () => {
    setEditando(null)
    setForm(INITIAL_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (t) => {
    setEditando(t)
    setForm({
      tipo: t.tipo,
      monto: String(t.monto),
      descripcion: t.descripcion || '',
      categoria_id: t.categoria_id ? String(t.categoria_id) : '',
      fecha: t.fecha
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
    if (field === 'tipo') next.categoria_id = ''
    setForm(next)
    const nextErrors = validateTransaccionForm(next)
    setErrors(nextErrors)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const nextErrors = validateTransaccionForm(form)
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setSaving(true)
    try {
      const payload = {
        tipo: form.tipo,
        monto: Number(form.monto),
        descripcion: form.descripcion.trim(),
        categoria_id: Number(form.categoria_id),
        fecha: form.fecha
      }

      if (editando) {
        await actualizarTransaccion(editando.id, payload)
        toast.success('Transaccion actualizada')
      } else {
        await crearTransaccion({
          ...payload,
          categoriaId: payload.categoria_id
        })
        toast.success('Transaccion creada')
      }
      closeModal()
    } catch (err) {
      toast.error(err?.message || 'Error al guardar transaccion')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await eliminarTransaccion(id)
      toast.success('Transaccion eliminada')
    } catch (err) {
      toast.error(err?.message || 'Error al eliminar')
    }
  }

  const getCategoriaInfo = (catId) => {
    const cat = categorias.find((c) => c.id === catId)
    return cat ? `${cat.icono || ''} ${cat.nombre}` : 'Sin categoria'
  }

  const disableSubmit = hasErrors(errors) || saving

  return (
    <div className="space-y-6 animate-[fadeIn_.35s_ease-out] pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#24389c] tracking-tight flex items-center gap-2">
            <ReceiptText className="w-7 h-7" /> Transacciones
          </h1>
          <p className="text-sm text-[#454652] mt-1">Gestiona tus ingresos y gastos</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#24389c] to-[#3f51b5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#24389c]/20 hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> Agregar transaccion
        </button>
      </div>

      {cargandoDatos ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#24389c] border-t-transparent" />
        </div>
      ) : transacciones.length === 0 ? (
        <div className="text-center py-20 text-[#757684]">
          <ReceiptText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-semibold">No hay transacciones aun</p>
          <p className="text-sm">Agrega tu primera transaccion para comenzar</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {transacciones.map((t) => (
            <div
              key={t.id}
              className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white rounded-2xl border border-[#c5c5d4]/30 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={[
                  'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                  t.tipo === 'ingreso'
                    ? 'bg-[#83fba5]/30 text-[#006d36]'
                    : 'bg-[#ffdad6]/50 text-[#93000a]'
                ].join(' ')}>
                  {t.tipo === 'ingreso'
                    ? <ArrowUpCircle className="w-5 h-5" />
                    : <ArrowDownCircle className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-[#191c1d] truncate">
                    {t.descripcion || (t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto')}
                  </p>
                  <p className="text-xs text-[#757684] truncate">
                    {getCategoriaInfo(t.categoria_id)} · {t.fecha}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <span className={[
                  'text-base font-bold whitespace-nowrap',
                  t.tipo === 'ingreso' ? 'text-[#006d36]' : 'text-[#93000a]'
                ].join(' ')}>
                  {t.tipo === 'ingreso' ? '+' : '-'}{formatMoneda(t.monto)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(t)}
                    className="p-2 rounded-lg text-[#454652] hover:bg-[#dee0ff] hover:text-[#24389c] transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 rounded-lg text-[#454652] hover:bg-[#ffdad6] hover:text-[#93000a] transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editando ? 'Editar transaccion' : 'Nueva transaccion'}
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
              form="form-transaccion"
              disabled={disableSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#24389c] to-[#3f51b5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#24389c]/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Guardar'}
            </button>
          </>
        }
      >
        <form id="form-transaccion" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">Tipo</label>
            <div className="flex gap-2">
              {['gasto', 'ingreso'].map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => handleChange('tipo', tipo)}
                  className={[
                    'flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all',
                    form.tipo === tipo
                      ? tipo === 'ingreso'
                        ? 'bg-[#83fba5]/30 border-[#006d36]/30 text-[#006d36]'
                        : 'bg-[#ffdad6]/50 border-[#93000a]/30 text-[#93000a]'
                      : 'border-[#c5c5d4]/40 text-[#757684] hover:bg-[#f3f4f5]'
                  ].join(' ')}
                >
                  {tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                </button>
              ))}
            </div>
            {errors.tipo && <p className="text-xs text-[#ba1a1a] mt-1">{errors.tipo}</p>}
          </div>

          <div>
            <label htmlFor="tx-monto" className="block text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">Monto</label>
            <input
              id="tx-monto"
              type="number"
              step="any"
              min="0"
              placeholder="0"
              value={form.monto}
              onChange={(e) => handleChange('monto', e.target.value)}
              className={[
                'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#191c1d] placeholder:text-[#757684]/50',
                'focus:outline-none focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all',
                errors.monto ? 'border-[#ba1a1a]' : 'border-[#c5c5d4]/40'
              ].join(' ')}
            />
            {errors.monto && <p className="text-xs text-[#ba1a1a] mt-1">{errors.monto}</p>}
          </div>

          <div>
            <label htmlFor="tx-cat" className="block text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">Categoria</label>
            <select
              id="tx-cat"
              value={form.categoria_id}
              onChange={(e) => handleChange('categoria_id', e.target.value)}
              className={[
                'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#191c1d]',
                'focus:outline-none focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all',
                errors.categoria_id ? 'border-[#ba1a1a]' : 'border-[#c5c5d4]/40'
              ].join(' ')}
            >
              <option value="">Selecciona una categoria</option>
              {categoriasFiltradas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icono || ''} {c.nombre}
                </option>
              ))}
            </select>
            {errors.categoria_id && <p className="text-xs text-[#ba1a1a] mt-1">{errors.categoria_id}</p>}
          </div>

          <div>
            <label htmlFor="tx-fecha" className="block text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">Fecha</label>
            <input
              id="tx-fecha"
              type="date"
              value={form.fecha}
              onChange={(e) => handleChange('fecha', e.target.value)}
              className={[
                'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#191c1d]',
                'focus:outline-none focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all',
                errors.fecha ? 'border-[#ba1a1a]' : 'border-[#c5c5d4]/40'
              ].join(' ')}
            />
            {errors.fecha && <p className="text-xs text-[#ba1a1a] mt-1">{errors.fecha}</p>}
          </div>

          <div>
            <label htmlFor="tx-desc" className="block text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">Descripcion (opcional)</label>
            <input
              id="tx-desc"
              type="text"
              placeholder="Ej: Almuerzo en la universidad"
              value={form.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              className="w-full rounded-xl border border-[#c5c5d4]/40 bg-white px-4 py-3 text-sm text-[#191c1d] placeholder:text-[#757684]/50 focus:outline-none focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
