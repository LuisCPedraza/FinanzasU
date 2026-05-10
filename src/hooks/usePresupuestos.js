import { useCallback, useMemo, useState } from 'react'
import { useAppDataContext } from '../context/AppDataContext'
import { calcularEstadoPresupuesto } from '../utils/presupuestoStatus'

function getPeriodo(fecha) {
  const [anioTxt, mesTxt] = String(fecha || '').split('-')
  return {
    anio: Number(anioTxt),
    mes: Number(mesTxt)
  }
}

function enriquecerPresupuesto(presupuesto, transacciones = []) {
  const gastado = transacciones
    .filter((t) => {
      if (t.tipo !== 'gasto') return false
      if (Number(t.categoria_id) !== Number(presupuesto.categoria_id)) return false
      const periodo = getPeriodo(t.fecha)
      return periodo.mes === Number(presupuesto.mes) && periodo.anio === Number(presupuesto.anio)
    })
    .reduce((acc, t) => acc + Number(t.monto || 0), 0)

  const estadoCalculado = calcularEstadoPresupuesto({
    gastado,
    monto_limite: presupuesto.monto_limite,
    umbral_alerta_pct: presupuesto.umbral_alerta_pct
  })

  return {
    ...presupuesto,
    gastado,
    porcentaje: estadoCalculado.porcentaje,
    estado: estadoCalculado.estado,
    restante: estadoCalculado.restante,
    umbral_alerta_pct: estadoCalculado.umbral_alerta_pct
  }
}

export function usePresupuestos(mes, anio) {
  const {
    presupuestos: presupuestosGlobales,
    transacciones,
    cargandoDatos,
    crearPresupuesto,
    actualizarPresupuesto,
    eliminarPresupuesto
  } = useAppDataContext()
  const [loadingOperacion, setLoadingOperacion] = useState(false)

  const presupuestos = useMemo(
    () => presupuestosGlobales
      .filter((p) => Number(p.mes) === Number(mes) && Number(p.anio) === Number(anio))
      .map((p) => enriquecerPresupuesto(p, transacciones)),
    [presupuestosGlobales, transacciones, mes, anio]
  )

  const resumen = useMemo(() => ({
    verde: presupuestos.filter((p) => p.estado === 'verde').length,
    amarillo: presupuestos.filter((p) => p.estado === 'amarillo').length,
    rojo: presupuestos.filter((p) => p.estado === 'rojo').length
  }), [presupuestos])

  const crear = useCallback(
    async (data) => {
      setLoadingOperacion(true)
      try {
        return await crearPresupuesto({
          ...data,
          mes,
          anio
        })
      } finally {
        setLoadingOperacion(false)
      }
    },
    [crearPresupuesto, mes, anio]
  )

  const actualizar = useCallback(
    async (id, data) => {
      setLoadingOperacion(true)
      try {
        return await actualizarPresupuesto(id, data, { mes, anio })
      } finally {
        setLoadingOperacion(false)
      }
    },
    [actualizarPresupuesto, mes, anio]
  )

  const eliminar = useCallback(
    async (id) => {
      setLoadingOperacion(true)
      try {
        await eliminarPresupuesto(id)
      } finally {
        setLoadingOperacion(false)
      }
    },
    [eliminarPresupuesto]
  )

  return {
    presupuestos,
    loading: cargandoDatos || loadingOperacion,
    resumen,
    crear,
    actualizar,
    eliminar
  }
}