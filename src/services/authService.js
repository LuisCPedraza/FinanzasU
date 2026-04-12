import { supabase } from './supabaseClient'

const MENSAJE_LOGIN_INVALIDO = 'Correo o contrasena incorrectos.'
const MENSAJE_AUTH_GENERICO = 'No fue posible autenticarte. Intenta nuevamente.'

function mapAuthError(error, fallbackMessage = MENSAJE_AUTH_GENERICO) {
  const message = (error?.message || '').toLowerCase()
  const code = (error?.code || '').toLowerCase()

  if (
    message.includes('invalid login credentials') ||
    code === 'invalid_credentials' ||
    code === 'email_not_confirmed'
  ) {
    return new Error(MENSAJE_LOGIN_INVALIDO)
  }

  if (message.includes('supabase no esta configurado')) {
    return new Error('Modo demo activo: configura Supabase para autenticar usuarios.')
  }

  return new Error(error?.message || fallbackMessage)
}

export function obtenerSesionActual() {
  return supabase.auth.getSession()
}

export function escucharCambiosAuth(callback) {
  return supabase.auth.onAuthStateChange(callback)
}

export async function registrarUsuario({ nombre, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nombre } }
  })

  if (error) throw mapAuthError(error, 'No se pudo crear la cuenta. Intenta nuevamente.')
  return data
}

export async function iniciarSesionUsuario({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw mapAuthError(error, MENSAJE_LOGIN_INVALIDO)
  return data
}

export async function cerrarSesionUsuario() {
  const { error } = await supabase.auth.signOut()
  if (error) throw mapAuthError(error, 'No fue posible cerrar sesion.')
}
