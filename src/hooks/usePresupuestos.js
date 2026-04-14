import { useState, useEffect, useCallback } from 'react'
import { useAppDataContext } from '../context/AppDataContext'
import { getPresupuestos, createPresupuesto, updatePresupuesto, deletePresupuesto } from '../services/presupuestosService'
import { useAuth } from './useAuth'

export function usePresupuestos(mes, anio) {
  const { usuario } = useAuth()
  const { presupuestos: presupuestosGlobales } = useAppDataContext()
  const [presupuestos, setPresupuestos] = useState([])
  const [loading, setLoading] = useState(false)

  // Cargar presupuestos filtrados por mes y año
  useEffect(() => {
    if (!usuario?.id || !mes || !anio) return

    const cargarPresupuestos = async () => {
      setLoading(true)
      try {
        const datos = await getPresupuestos(usuario.id, mes, anio)
        setPresupuestos(datos)
      } catch (error) {
        console.error('Error al cargar presupuestos:', error)
        setPresupuestos([])
      } finally {
        setLoading(false)
      }
    }

    cargarPresupuestos()
  }, [usuario?.id, mes, anio])

  // ✅ FIX: resumen como objeto directo, no como función envuelta en useCallback
  const resumen = {
    verde: presupuestos.filter((p) => p.estado === 'verde').length,
    amarillo: presupuestos.filter((p) => p.estado === 'amarillo').length,
    rojo: presupuestos.filter((p) => p.estado === 'rojo').length,
  }

  // Crear presupuesto
  const crear = useCallback(
    async (data) => {
      if (!usuario?.id) throw new Error('Usuario no autenticado')
      const nuevoPresupuesto = await createPresupuesto({
        ...data,
        user_id: usuario.id,
        mes,
        anio,
      })
      setPresupuestos((prev) => [...prev, nuevoPresupuesto])
      return nuevoPresupuesto
    },
    [usuario?.id, mes, anio]
  )

  // ✅ FIX: Se pasan mes y anio para poder enriquecer el resultado de updatePresupuesto
  const actualizar = useCallback(
    async (id, data) => {
      if (!usuario?.id) throw new Error('Usuario no autenticado')
      const presupuestoActualizado = await updatePresupuesto(id, usuario.id, data, mes, anio)
      setPresupuestos((prev) => prev.map((p) => (p.id === id ? presupuestoActualizado : p)))
      return presupuestoActualizado
    },
    [usuario?.id, mes, anio]
  )

  // Eliminar presupuesto
  const eliminar = useCallback(
    async (id) => {
      if (!usuario?.id) throw new Error('Usuario no autenticado')
      await deletePresupuesto(id, usuario.id)
      setPresupuestos((prev) => prev.filter((p) => p.id !== id))
    },
    [usuario?.id]
  )

  return {
    presupuestos,
    loading,
    resumen,
    crear,
    actualizar,
    eliminar,
  }
}