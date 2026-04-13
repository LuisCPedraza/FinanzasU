import { useState } from 'react'
import { Plus, Trash2, Pencil, PiggyBank, ChevronLeft, ChevronRight } from 'lucide-react'
import { usePresupuestos } from '@/hooks/usePresupuestos'
import { useCategorias } from '@/hooks/useCategorias'
import { formatMoneda } from '@/utils/formatMoneda'
import { MESES } from '@/utils/constants'
import { formValidators, hasErrors, getFieldError } from '@/utils/validationHelpers'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import AlertBadge from '@/components/ui/AlertBadge'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'

const FORM_INICIAL = {
  categoria_id: '',
  monto_limite: '',
}

export default function Presupuestos() {
  const ahora = new Date()
  const [mes, setMes] = useState(ahora.getMonth() + 1)
  const [anio, setAnio] = useState(ahora.getFullYear())
  const { presupuestos, loading, resumen, crear, actualizar, eliminar } = usePresupuestos(mes, anio)
  const { categorias } = useCategorias('gasto')

  const [modalOpen, setModalOpen] = useState(false)
  const [deleteModal, setDeleteModal] = useState(null)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(FORM_INICIAL)
  const [errors, setErrors] = useState({})

  const categoriasOpciones = categorias.map((c) => ({ value: c.id, label: `${c.icono} ${c.nombre}` }))

  const validarFormulario = (formData) => {
    const nuevosErrores = formValidators.presupuesto(formData)
    setErrors(nuevosErrores)
    return !hasErrors(nuevosErrores)
  }

  const cambiarMes = (d) => {
    let m = mes + d
    let a = anio
    if (m > 12) { m = 1; a++ }
    if (m < 1) { m = 12; a-- }
    setMes(m)
    setAnio(a)
  }

  const abrirCrear = () => {
    setEditId(null)
    setForm(FORM_INICIAL)
    setErrors({})
    setModalOpen(true)
  }

  const abrirEditar = (id, catId, limite) => {
    setEditId(id)
    setForm({ categoria_id: catId, monto_limite: String(limite) })
    setErrors({})
    setModalOpen(true)
  }

  const cerrarModal = () => {
    setModalOpen(false)
    setErrors({})
  }

  const handleSubmit = async () => {
    if (!validarFormulario(form)) return
    try {
      if (editId) {
        await actualizar(editId, { monto_limite: parseFloat(form.monto_limite) })
      } else {
        await crear({ categoria_id: form.categoria_id, monto_limite: parseFloat(form.monto_limite) })
      }
      cerrarModal()
    } catch {
      // manejado por el hook
    }
  }

  const confirmarEliminar = async () => {
    if (deleteModal) {
      await eliminar(deleteModal)
      setDeleteModal(null)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-10 animate-fade-in pb-20">

      {/* Encabezado */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tighter text-on-background mb-2">
            Presupuestos
          </h2>
          <p className="text-on-surface-variant font-medium">
            Planificación mensual para {MESES[mes - 1]} {anio}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Selector de mes */}
          <div className="flex items-center gap-2 bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant/20 w-fit">
            <button
              onClick={() => cambiarMes(-1)}
              className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-primary min-w-[130px] text-center">
              {MESES[mes - 1]} {anio}
            </span>
            <button
              onClick={() => cambiarMes(1)}
              className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <Button onClick={abrirCrear} size="md" icon={Plus}>
            Nuevo presupuesto
          </Button>
        </div>
      </div>

      {/* Listado */}
      {presupuestos.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="Sin presupuestos asignados"
          description="Define cuánto quieres gastar máximo cada mes por categoría."
          actionLabel="Asignar un límite"
          onAction={abrirCrear}
        />
      ) : (
        <section className="space-y-6">
          {/* Resumen de alertas */}
          <div className="flex flex-wrap gap-3">
            <AlertBadge estado="verde" label={`${resumen.verde} Sanos`} />
            <AlertBadge estado="amarillo" label={`${resumen.amarillo} Alertas`} pulse={resumen.amarillo > 0} />
            <AlertBadge estado="rojo" label={`${resumen.rojo} Excedidos`} pulse={resumen.rojo > 0} />
          </div>

          {/* Tabla de presupuestos */}
          <div className="bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/15">

            {/* Cabecera de columnas */}
            <div className="grid grid-cols-12 px-8 py-5 bg-surface-container-low border-b border-outline-variant/10">
              <div className="col-span-4 text-xs font-bold text-outline uppercase tracking-wider">
                Categoría
              </div>
              <div className="col-span-3 text-xs font-bold text-outline uppercase tracking-wider">
                Gastado / Límite
              </div>
              <div className="col-span-3 text-xs font-bold text-outline uppercase tracking-wider">
                Progreso
              </div>
              <div className="col-span-2 text-xs font-bold text-outline uppercase tracking-wider text-right">
                Acciones
              </div>
            </div>

            {/* Filas */}
            <div className="divide-y divide-outline-variant/10">
              {presupuestos.map((p) => (
                <div
                  key={p.id}
                  className="grid grid-cols-12 px-8 py-5 items-center hover:bg-surface-container-low transition-colors group"
                >
                  {/* Categoría */}
                  <div className="col-span-4 flex items-center gap-4 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform flex-shrink-0 ${
                        p.estado === 'rojo'
                          ? 'bg-tertiary-fixed'
                          : p.estado === 'amarillo'
                          ? 'bg-primary-fixed'
                          : 'bg-secondary-container'
                      }`}
                    >
                      {p.categorias?.icono || '🏷️'}
                    </div>
                    <p className="font-bold text-on-surface truncate">
                      {p.categorias?.nombre || 'Categoría'}
                    </p>
                  </div>

                  {/* Montos */}
                  <div className="col-span-3">
                    <p className="text-sm font-bold text-on-surface">
                      {formatMoneda(p.gastado)}
                    </p>
                    <p className="text-xs text-outline font-medium">
                      de {formatMoneda(p.monto_limite)}
                    </p>
                  </div>

                  {/* Barra de progreso */}
                  <div className="col-span-3 pr-4">
                    <div
                      className={`w-full h-2 rounded-full overflow-hidden mb-1 ${
                        p.estado === 'rojo'
                          ? 'bg-error-container/40'
                          : p.estado === 'amarillo'
                          ? 'bg-primary-fixed/50'
                          : 'bg-secondary-container/40'
                      }`}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          p.estado === 'rojo'
                            ? 'bg-tertiary'
                            : p.estado === 'amarillo'
                            ? 'bg-primary'
                            : 'bg-secondary'
                        }`}
                        style={{ width: `${Math.min(p.porcentaje, 100)}%` }}
                      />
                    </div>
                    <p
                      className={`text-xs font-bold ${
                        p.estado === 'rojo'
                          ? 'text-error'
                          : p.estado === 'amarillo'
                          ? 'text-primary'
                          : 'text-secondary'
                      }`}
                    >
                      {Math.round(p.porcentaje)}% · {formatMoneda(p.restante)} restantes
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="col-span-2 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => abrirEditar(p.id, p.categoria_id, Number(p.monto_limite))}
                      className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface-variant transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteModal(p.id)}
                      className="p-2 rounded-lg bg-error-container hover:bg-error/20 text-error transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-40 md:hidden">
        <button
          onClick={abrirCrear}
          className="w-14 h-14 bg-gradient-to-br from-primary to-primary-container text-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Modal Crear / Editar */}
      <Modal
        isOpen={modalOpen}
        onClose={cerrarModal}
        title={editId ? 'Editar límite' : 'Asignar presupuesto'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={hasErrors(errors)}>
              {editId ? 'Guardar' : 'Confirmar'}
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {!editId && (
            <Select
              id="pres-cat"
              label="Selecciona la categoría"
              options={categoriasOpciones}
              value={form.categoria_id}
              error={getFieldError(errors, 'categoria_id')}
              onChange={(e) => {
                const newForm = { ...form, categoria_id: e.target.value }
                setForm(newForm)
                validarFormulario(newForm)
              }}
            />
          )}
          <Input
            id="pres-monto"
            label="¿Cuál es tu límite? (COP)"
            type="number"
            placeholder="Ej. 100000"
            value={form.monto_limite}
            error={getFieldError(errors, 'monto_limite')}
            onChange={(e) => {
              const newForm = { ...form, monto_limite: e.target.value }
              setForm(newForm)
              validarFormulario(newForm)
            }}
          />
        </div>
      </Modal>

      {/* Modal Confirmar Eliminar */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Eliminar presupuesto"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmarEliminar}>
              Eliminar
            </Button>
          </>
        }
      >
        <p className="text-on-surface-variant font-medium">
          ¿Eliminar este presupuesto? Tus transacciones no se borrarán.
        </p>
      </Modal>
    </div>
  )
}