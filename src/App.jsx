import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transacciones from './pages/Transacciones'
import Perfil from './pages/Perfil'
import Presupuestos from './pages/Presupuestos'
import Categorias from './pages/Categorias'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import './auth-theme.css'

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/transacciones" element={
            <ProtectedRoute>
              <Layout>
                <Transacciones />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Layout>
                <Perfil />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/presupuestos" element={
            <ProtectedRoute>
              <Layout>
                <Presupuestos />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/categorias" element={
            <ProtectedRoute>
              <Layout>
                <Categorias />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </>
  )
}