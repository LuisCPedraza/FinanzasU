import { useState, useMemo } from 'react'
import { useTransacciones } from './useTransacciones'

export const PAGE_SIZES = [10, 25, 50]

const FILTROS_INICIALES = {
  meses: [],
  anios: [],
  texto: '',
  tipo: '',
  categoriaIds: []
}

export function useTransaccionesFiltros() {
  const { transacciones, cargandoDatos, ...rest } = useTransacciones()

  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const [pagina, setPagina] = useState(1)
  const [porPagina, setPorPagina] = useState(10)

  const actualizarFiltro = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }))
    setPagina(1)
  }

  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES)
    setPagina(1)
  }

  const hayFiltrosActivos =
    filtros.meses.length > 0 ||
    filtros.anios.length > 0 ||
    filtros.categoriaIds.length > 0 ||
    filtros.tipo !== '' ||
    filtros.texto !== ''

  const conteoFiltros =
    filtros.meses.length +
    filtros.anios.length +
    filtros.categoriaIds.length +
    (filtros.tipo ? 1 : 0)

  // Años disponibles derivados de las transacciones cargadas
  const aniosDisponibles = useMemo(() => {
    const set = new Set(
      transacciones.map((t) => new Date(t.fecha + 'T00:00:00').getFullYear())
    )
    return [...set].sort((a, b) => b - a)
  }, [transacciones])

  // Meses disponibles derivados de las transacciones cargadas (orden 1-12)
  const mesesDisponibles = useMemo(() => {
    const set = new Set(
      transacciones.map((t) => new Date(t.fecha + 'T00:00:00').getMonth() + 1)
    )
    return [...set].sort((a, b) => a - b)
  }, [transacciones])

  // Filtrado combinado – el origen ya viene ordenado fecha desc desde el servicio
  const transaccionesFiltradas = useMemo(() => {
    let resultado = transacciones

    if (filtros.meses.length > 0) {
      resultado = resultado.filter((t) =>
        filtros.meses.includes(String(new Date(t.fecha + 'T00:00:00').getMonth() + 1))
      )
    }

    if (filtros.anios.length > 0) {
      resultado = resultado.filter((t) =>
        filtros.anios.includes(String(new Date(t.fecha + 'T00:00:00').getFullYear()))
      )
    }

    if (filtros.tipo) {
      resultado = resultado.filter((t) => t.tipo === filtros.tipo)
    }

    if (filtros.categoriaIds.length > 0) {
      resultado = resultado.filter((t) =>
        filtros.categoriaIds.includes(String(t.categoria_id))
      )
    }

    if (filtros.texto.trim()) {
      const q = filtros.texto.trim().toLowerCase()
      resultado = resultado.filter((t) =>
        (t.descripcion || '').toLowerCase().includes(q)
      )
    }

    return resultado
  }, [transacciones, filtros])

  const totalPaginas = Math.max(1, Math.ceil(transaccionesFiltradas.length / porPagina))
  const paginaValida = Math.min(pagina, totalPaginas)

  const transaccionesPaginadas = useMemo(() => {
    const inicio = (paginaValida - 1) * porPagina
    return transaccionesFiltradas.slice(inicio, inicio + porPagina)
  }, [transaccionesFiltradas, paginaValida, porPagina])

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) setPagina(nueva)
  }

  const cambiarPorPagina = (n) => {
    setPorPagina(n)
    setPagina(1)
  }

  return {
    transacciones,
    cargandoDatos,
    ...rest,
    filtros,
    actualizarFiltro,
    limpiarFiltros,
    hayFiltrosActivos,
    conteoFiltros,
    aniosDisponibles,
    mesesDisponibles,
    transaccionesFiltradas,
    transaccionesPaginadas,
    pagina: paginaValida,
    porPagina,
    totalPaginas,
    totalFiltradas: transaccionesFiltradas.length,
    cambiarPagina,
    cambiarPorPagina
  }
}
