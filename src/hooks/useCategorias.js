import { useAppDataContext } from '../context/AppDataContext'

export function useCategorias() {
  const { categorias, cargandoDatos, errorGlobal } = useAppDataContext()
  return { categorias, cargandoDatos, errorGlobal }
}
