import { useAppDataContext } from '../context/AppDataContext'

export function useCategorias() {
  const {
    categorias,
    cargandoDatos,
    errorGlobal,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
  } = useAppDataContext()

  return {
    categorias,
    cargandoDatos,
    errorGlobal,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
  }
}
