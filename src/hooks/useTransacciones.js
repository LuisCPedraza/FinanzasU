import { useAppDataContext } from '../context/AppDataContext'

export function useTransacciones() {
  const {
    transacciones,
    cargandoDatos,
    errorGlobal,
    crearTransaccion,
    actualizarTransaccion,
    eliminarTransaccion,
    setErrorGlobal
  } = useAppDataContext()

  return {
    transacciones,
    cargandoDatos,
    errorGlobal,
    crearTransaccion,
    actualizarTransaccion,
    eliminarTransaccion,
    limpiarError: () => setErrorGlobal('')
  }
}
