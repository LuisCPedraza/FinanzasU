import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { AppDataProvider } from './context/AppDataContext'
import { NotificationsProvider } from './context/NotificationsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <NotificationsProvider>
        <AppDataProvider>
          <App />
        </AppDataProvider>
      </NotificationsProvider>
    </AuthProvider>
  </StrictMode>,
)
