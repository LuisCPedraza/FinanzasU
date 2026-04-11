import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { usuario, cargando } = useAuth()

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Validando sesion...</p>
    </div>
  )

  if (!usuario) return <Navigate to="/login" replace />

  return children
}