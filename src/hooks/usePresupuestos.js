import { useAppDataContext } from '../context/AppDataContext'

export function usePresupuestos() {
  const { presupuestos, cargandoDatos, errorGlobal } = useAppDataContext()
  return { presupuestos, cargandoDatos, errorGlobal }
}
