import { useAppDataContext } from '../context/AppDataContext'

export function useTransacciones() {
  const {
    transacciones,
    cargandoDatos,
    errorGlobal,
    crearTransaccion,
    setErrorGlobal
  } = useAppDataContext()

  return {
    transacciones,
    cargandoDatos,
    errorGlobal,
    crearTransaccion,
    limpiarError: () => setErrorGlobal('')
  }
}
