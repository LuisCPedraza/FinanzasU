import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Plus,
  Pencil,
  Trash2,
  Tag,
  Lock
} from 'lucide-react'
import { useCategorias } from '../hooks/useCategorias'
import Modal from '../components/ui/Modal'
import { validateCategoriaForm, hasErrors } from '../utils/validationHelpers'

const EMOJIS = [
  '🍔', '🛒', '🚌', '🏠', '💡', '📱', '🎓', '💊', '🎬', '🎮',
  '👕', '✈️', '💰', '💼', '📚', '🎵', '⚽', '🐾', '🎁', '☕',
  '🍕', '🚗', '💻', '🏋️', '🎨', '🛍️', '📦', '🔧', '🌐', '❤️'
]

const INITIAL_FORM = { nombre: '', tipo: 'gasto', icono: '🏷️', color: '#6366f1' }

export default function Categorias() {
  const {
    categorias,
    cargandoDatos,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
  } = useCategorias()

  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const predeterminadas = categorias.filter((c) => c.es_predeterminada || !c.user_id)
  const personalizadas = categorias.filter((c) => !c.es_predeterminada && c.user_id)

  const openCreate = () => {
    setEditando(null)
    setForm(INITIAL_FORM)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (c) => {
    setEditando(c)
    setForm({
      nombre: c.nombre,
      tipo: c.tipo,
      icono: c.icono || '🏷️',
      color: c.color || '#6366f1'
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
    e.preventDefault()
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
      closeModal()
    } catch (err) {
      toast.error(err?.message || 'Error al guardar categoria')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await eliminarCategoria(id)
      toast.success('Categoria eliminada')
    } catch (err) {
      toast.error(err?.message || 'Error al eliminar')
    }
  }

  const disableSubmit = hasErrors(errors) || saving

  const CategoriaCard = ({ cat, editable }) => (
    <div className="flex items-center gap-3 bg-white rounded-2xl border border-[#c5c5d4]/30 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
        style={{ backgroundColor: `${cat.color || '#6366f1'}20` }}
      >
        {cat.icono || '🏷️'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[#191c1d] truncate">{cat.nombre}</p>
        <p className="text-xs text-[#757684]">
          {cat.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
          {!editable && <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-[#757684]"><Lock className="w-3 h-3" /> Predeterminada</span>}
        </p>
      </div>
      {editable && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => openEdit(cat)}
            className="p-2 rounded-lg text-[#454652] hover:bg-[#dee0ff] hover:text-[#24389c] transition-colors"
            title="Editar"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(cat.id)}
            className="p-2 rounded-lg text-[#454652] hover:bg-[#ffdad6] hover:text-[#93000a] transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6 animate-[fadeIn_.35s_ease-out] pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#24389c] tracking-tight flex items-center gap-2">
            <Tag className="w-7 h-7" /> Categorias
          </h1>
          <p className="text-sm text-[#454652] mt-1">Organiza tus ingresos y gastos por categoria</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#24389c] to-[#3f51b5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#24389c]/20 hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> Agregar categoria
        </button>
      </div>

      {cargandoDatos ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#24389c] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-8">
          {personalizadas.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-[#454652] uppercase tracking-widest mb-3">Mis categorias</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {personalizadas.map((c) => (
                  <CategoriaCard key={c.id} cat={c} editable />
                ))}
              </div>
            </div>
          )}

          {personalizadas.length === 0 && (
            <div className="text-center py-10 text-[#757684]">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-semibold">No tienes categorias personalizadas</p>
              <p className="text-sm">Crea una para organizar mejor tus finanzas</p>
            </div>
          )}

          {predeterminadas.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-[#454652] uppercase tracking-widest mb-3">Predeterminadas</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {predeterminadas.map((c) => (
                  <CategoriaCard key={c.id} cat={c} editable={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editando ? 'Editar categoria' : 'Nueva categoria'}
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
              form="form-categoria"
              disabled={disableSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#24389c] to-[#3f51b5] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#24389c]/20 hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : editando ? 'Actualizar' : 'Guardar'}
            </button>
          </>
        }
      >
        <form id="form-categoria" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cat-nombre" className="block text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">Nombre</label>
            <input
              id="cat-nombre"
              type="text"
              placeholder="Ej: Comida rapida"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              className={[
                'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#191c1d] placeholder:text-[#757684]/50',
                'focus:outline-none focus:ring-4 focus:ring-[#dee0ff] focus:border-[#24389c] transition-all',
                errors.nombre ? 'border-[#ba1a1a]' : 'border-[#c5c5d4]/40'
              ].join(' ')}
            />
            {errors.nombre && <p className="text-xs text-[#ba1a1a] mt-1">{errors.nombre}</p>}
          </div>

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
            <label className="block text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">Icono</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleChange('icono', emoji)}
                  className={[
                    'w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-all',
                    form.icono === emoji
                      ? 'border-[#24389c] bg-[#dee0ff] shadow-sm'
                      : 'border-[#c5c5d4]/40 hover:bg-[#f3f4f5]'
                  ].join(' ')}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="cat-color" className="block text-[10px] uppercase tracking-widest font-bold text-[#757684] mb-2">Color</label>
            <input
              id="cat-color"
              type="color"
              value={form.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-12 h-10 rounded-lg border border-[#c5c5d4]/40 cursor-pointer"
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
