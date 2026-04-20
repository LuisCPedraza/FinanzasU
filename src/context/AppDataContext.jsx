import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuthContext } from './AuthContext'
import { listarCategorias, crearCategoria as crearCategoriaService, actualizarCategoria as actualizarCategoriaService, eliminarCategoria as eliminarCategoriaService } from '../services/categoriasService'
import { listarTransacciones, crearTransaccion as crearTransaccionService, actualizarTransaccion as actualizarTransaccionService, eliminarTransaccion as eliminarTransaccionService } from '../services/transaccionesService'
import { listarPresupuestos } from '../services/presupuestosService'
import { useNotificationsContext } from './NotificationsContext'

const AppDataContext = createContext(null)

function getPeriodo(fecha) {
  const [anioTxt, mesTxt] = String(fecha || '').split('-')
  return {
    anio: Number(anioTxt),
    mes: Number(mesTxt)
  }
}

function totalGastosCategoriaPeriodo(transacciones, categoriaId, mes, anio) {
  return transacciones
    .filter((t) => {
      if (t.tipo !== 'gasto') return false
      if (Number(t.categoria_id) !== Number(categoriaId)) return false

      const periodo = getPeriodo(t.fecha)
      return periodo.mes === Number(mes) && periodo.anio === Number(anio)
    })
    .reduce((acum, t) => acum + Number(t.monto || 0), 0)
}

export function AppDataProvider({ children }) {
  const { usuario } = useAuthContext()
  const { registrarNotificacion } = useNotificationsContext()

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

    const nextTransacciones = [nuevaTransaccion, ...transacciones]
    setTransacciones(nextTransacciones)

    try {
      const categoria = categorias.find((c) => Number(c.id) === Number(categoriaId))
      const categoriaNombre = categoria?.nombre || 'categoria'
      await registrarNotificacion({
        tipo: 'transaccion',
        titulo: 'Nueva transaccion registrada',
        mensaje: `Registraste ${tipo === 'ingreso' ? 'un ingreso' : 'un gasto'} de ${monto} en ${categoriaNombre}.`,
        moduloOrigen: 'transacciones',
        rutaDestino: '/transacciones',
        recursoTipo: 'transaccion',
        recursoId: String(nuevaTransaccion.id),
        eventKey: `transaccion-${nuevaTransaccion.id}`,
        dedupeMinutes: null
      })

      if (tipo === 'gasto') {
        const { anio, mes } = getPeriodo(fecha)
        const presupuesto = presupuestos.find((p) =>
          Number(p.categoria_id) === Number(categoriaId)
          && Number(p.mes) === Number(mes)
          && Number(p.anio) === Number(anio)
        )

        if (presupuesto) {
          const totalGasto = totalGastosCategoriaPeriodo(nextTransacciones, categoriaId, mes, anio)
          const limite = Number(presupuesto.monto_limite || 0)

          if (totalGasto > limite) {
            await registrarNotificacion({
              tipo: 'presupuesto',
              titulo: 'Presupuesto excedido',
              mensaje: `Tu categoria ${categoriaNombre} supero el limite del periodo ${mes}/${anio}.`,
              moduloOrigen: 'presupuestos',
              rutaDestino: '/presupuestos',
              recursoTipo: 'presupuesto',
              recursoId: String(presupuesto.id),
              eventKey: `presupuesto-excedido-${presupuesto.id}-${anio}-${mes}`,
              dedupeMinutes: null
            })
          }
        }
      }
    } catch (notificationError) {
      console.warn('No se pudo registrar notificacion de transaccion:', notificationError)
    }

    return nuevaTransaccion
  }, [usuario?.id, categorias, presupuestos, transacciones, registrarNotificacion])

  const actualizarTransaccion = useCallback(async (id, data) => {
    if (!usuario?.id) throw new Error('Sesion invalida.')
    setErrorGlobal('')
    const anterior = transacciones.find((t) => t.id === id)
    const actualizada = await actualizarTransaccionService(id, usuario.id, data)

    const nextTransacciones = transacciones.map((t) => (t.id === id ? actualizada : t))
    setTransacciones(nextTransacciones)

    try {
      const categoria = categorias.find((c) => Number(c.id) === Number(actualizada.categoria_id))
      const categoriaNombre = categoria?.nombre || 'categoria'

      if (actualizada.tipo === 'gasto') {
        const periodo = getPeriodo(actualizada.fecha)
        const presupuesto = presupuestos.find((p) =>
          Number(p.categoria_id) === Number(actualizada.categoria_id)
          && Number(p.mes) === Number(periodo.mes)
          && Number(p.anio) === Number(periodo.anio)
        )

        if (presupuesto) {
          const totalDespues = totalGastosCategoriaPeriodo(
            nextTransacciones,
            actualizada.categoria_id,
            periodo.mes,
            periodo.anio
          )

          const totalAntes = anterior
            ? totalGastosCategoriaPeriodo(
              transacciones,
              actualizada.categoria_id,
              periodo.mes,
              periodo.anio
            )
            : 0

          const limite = Number(presupuesto.monto_limite || 0)
          if (totalDespues > limite && totalAntes <= limite) {
            await registrarNotificacion({
              tipo: 'presupuesto',
              titulo: 'Presupuesto excedido',
              mensaje: `Tu categoria ${categoriaNombre} supero el limite del periodo ${periodo.mes}/${periodo.anio}.`,
              moduloOrigen: 'presupuestos',
              rutaDestino: '/presupuestos',
              recursoTipo: 'presupuesto',
              recursoId: String(presupuesto.id),
              eventKey: `presupuesto-excedido-${presupuesto.id}-${periodo.anio}-${periodo.mes}`,
              dedupeMinutes: null
            })
          }
        }
      }
    } catch (notificationError) {
      console.warn('No se pudo registrar notificacion de presupuesto:', notificationError)
    }

    return actualizada
  }, [usuario?.id, categorias, presupuestos, transacciones, registrarNotificacion])

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
