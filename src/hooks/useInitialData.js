import { useAppDataContext } from '../context/AppDataContext'

export function useInitialData() {
  const {
    categorias,
    transacciones,
    presupuestos,
    cargandoDatos,
    errorGlobal,
    cargarDatosIniciales
  } = useAppDataContext()

  return {
    categorias,
    transacciones,
    presupuestos,
    cargandoDatos,
    errorGlobal,
    recargar: cargarDatosIniciales
  }
}
