import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuthContext } from './AuthContext'
import { listarCategorias, crearCategoria as crearCategoriaService, actualizarCategoria as actualizarCategoriaService, eliminarCategoria as eliminarCategoriaService } from '../services/categoriasService'
import { listarTransacciones, crearTransaccion as crearTransaccionService, actualizarTransaccion as actualizarTransaccionService, eliminarTransaccion as eliminarTransaccionService } from '../services/transaccionesService'
import { listarPresupuestos } from '../services/presupuestosService'

const AppDataContext = createContext(null)

export function AppDataProvider({ children }) {
  const { usuario } = useAuthContext()

  const [categorias, setCategorias] = useState([])
  const [transacciones, setTransacciones] = useState([])
  const [presupuestos, setPresupuestos] = useState([])
  const [cargandoDatos, setCargandoDatos] = useState(false)
  const [errorGlobal, setErrorGlobal] = useState('')

  const limpiarEstado = useCallback(() => {
    setCategorias([])
    setTransacciones([])
    setPresupuestos([])
    setErrorGlobal('')
    setCargandoDatos(false)
  }, [])

  const cargarDatosIniciales = useCallback(async () => {
    if (!usuario?.id) {
      limpiarEstado()
      return
    }

    setCargandoDatos(true)
    setErrorGlobal('')

    try {
      const [categoriasData, transaccionesData, presupuestosData] = await Promise.all([
        listarCategorias(usuario.id),
        listarTransacciones(usuario.id),
        listarPresupuestos(usuario.id)
      ])

      setCategorias(categoriasData)
      setTransacciones(transaccionesData)
      setPresupuestos(presupuestosData)
    } catch (error) {
      setErrorGlobal(error.message || 'No se pudieron cargar los datos.')
    } finally {
      setCargandoDatos(false)
    }
  }, [limpiarEstado, usuario?.id])

  useEffect(() => {
    cargarDatosIniciales()
  }, [cargarDatosIniciales])

  const crearTransaccion = useCallback(async ({ tipo, monto, descripcion, categoriaId, fecha }) => {
    if (!usuario?.id) {
      throw new Error('Sesion invalida. Inicia sesion nuevamente.')
    }

    setErrorGlobal('')

    const nuevaTransaccion = await crearTransaccionService({
      user_id: usuario.id,
      tipo,
      monto,
      descripcion,
      categoria_id: categoriaId,
      fecha
    })

    setTransacciones((prev) => [nuevaTransaccion, ...prev])
    return nuevaTransaccion
  }, [usuario?.id])

  const actualizarTransaccion = useCallback(async (id, data) => {
    if (!usuario?.id) throw new Error('Sesion invalida.')
    setErrorGlobal('')
    const actualizada = await actualizarTransaccionService(id, usuario.id, data)
    setTransacciones((prev) => prev.map((t) => (t.id === id ? actualizada : t)))
    return actualizada
  }, [usuario?.id])

  const eliminarTransaccion = useCallback(async (id) => {
    if (!usuario?.id) throw new Error('Sesion invalida.')
    setErrorGlobal('')
    await eliminarTransaccionService(id, usuario.id)
    setTransacciones((prev) => prev.filter((t) => t.id !== id))
  }, [usuario?.id])

  const crearCategoria = useCallback(async (data) => {
    if (!usuario?.id) throw new Error('Sesion invalida.')
    setErrorGlobal('')
    const nueva = await crearCategoriaService({ ...data, user_id: usuario.id, es_predeterminada: false })
    setCategorias((prev) => [...prev, nueva])
    return nueva
  }, [usuario?.id])

  const actualizarCategoria = useCallback(async (id, data) => {
    if (!usuario?.id) throw new Error('Sesion invalida.')
    setErrorGlobal('')
    const actualizada = await actualizarCategoriaService(id, usuario.id, data)
    setCategorias((prev) => prev.map((c) => (c.id === id ? actualizada : c)))
    return actualizada
  }, [usuario?.id])

  const eliminarCategoria = useCallback(async (id) => {
    if (!usuario?.id) throw new Error('Sesion invalida.')
    setErrorGlobal('')
    await eliminarCategoriaService(id, usuario.id)
    setCategorias((prev) => prev.filter((c) => c.id !== id))
  }, [usuario?.id])

  const totales = useMemo(() => {
    const totalIngresos = transacciones
      .filter((t) => t.tipo === 'ingreso')
      .reduce((acum, t) => acum + Number(t.monto || 0), 0)

    const totalGastos = transacciones
      .filter((t) => t.tipo === 'gasto')
      .reduce((acum, t) => acum + Number(t.monto || 0), 0)

    return {
      ingresos: totalIngresos,
      gastos: totalGastos,
      balance: totalIngresos - totalGastos
    }
  }, [transacciones])

  const value = useMemo(() => ({
    categorias,
    transacciones,
    presupuestos,
    cargandoDatos,
    errorGlobal,
    totales,
    setErrorGlobal,
    cargarDatosIniciales,
    crearTransaccion,
    actualizarTransaccion,
    eliminarTransaccion,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    limpiarEstado
  }), [
    categorias,
    transacciones,
    presupuestos,
    cargandoDatos,
    errorGlobal,
    totales,
    cargarDatosIniciales,
    crearTransaccion,
    actualizarTransaccion,
    eliminarTransaccion,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
    limpiarEstado
  ])

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppDataContext() {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppDataContext debe usarse dentro de AppDataProvider')
  }
  return context
}
