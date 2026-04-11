import { useAuth } from '../hooks/useAuth'
import { useInitialData } from '../hooks/useInitialData'
import { useAppDataContext } from '../context/AppDataContext'
import { Link, useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { usuario, cerrarSesion } = useAuth()
  const { transacciones, cargandoDatos, errorGlobal } = useInitialData()
  const { totales, limpiarEstado } = useAppDataContext()
  const navigate = useNavigate()

  const handleLogout = async () => {
    limpiarEstado()
    await cerrarSesion()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-indigo-600 mb-2">
          Bienvenido a FinanzasU
        </h1>
        <p className="text-gray-600">
          Sesión activa como: <strong>{usuario?.email}</strong>
        </p>

        {errorGlobal && (
          <p className="rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
            Error de carga: {errorGlobal}
          </p>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <article className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Ingresos</p>
            <p className="text-2xl font-semibold text-green-600">${totales.ingresos.toFixed(2)}</p>
          </article>
          <article className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Gastos</p>
            <p className="text-2xl font-semibold text-red-600">${totales.gastos.toFixed(2)}</p>
          </article>
          <article className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Balance</p>
            <p className="text-2xl font-semibold text-indigo-600">${totales.balance.toFixed(2)}</p>
          </article>
        </section>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {cargandoDatos ? 'Cargando datos...' : `Transacciones registradas: ${transacciones.length}`}
          </p>
          <Link
            to="/transacciones"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Nueva transaccion
          </Link>
        </div>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}