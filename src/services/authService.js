import { supabase } from './supabaseClient'

const MENSAJE_LOGIN_INVALIDO = 'Correo o contrasena incorrectos.'
const MENSAJE_AUTH_GENERICO = 'No fue posible autenticarte. Intenta nuevamente.'
const MENSAJE_PASSWORD_INVALIDA = 'La nueva contrasena no cumple la politica minima.'
const MENSAJE_EMAIL_NO_CONFIRMADO = 'Debes confirmar tu correo antes de iniciar sesion. Revisa tu bandeja de entrada.'
const MENSAJE_RATE_LIMIT_EMAIL = 'Se alcanzo el limite de envios de correo. Espera unos minutos antes de intentar de nuevo.'
const MENSAJE_EMAIL_YA_REGISTRADO = 'Este correo ya esta registrado. Inicia sesion o recupera tu acceso.'
const MENSAJE_EMAIL_INVALIDO = 'El correo ingresado no es valido.'
const MENSAJE_REGISTRO_NO_DISPONIBLE = 'El registro de nuevas cuentas no esta disponible en este momento.'
const MENSAJE_SUPABASE_NO_CONFIGURADO = 'Modo demo activo: configura Supabase para autenticar usuarios.'
const EMAIL_REGEX = /\S+@\S+\.\S+/

function mapAuthError(error, fallbackMessage = MENSAJE_AUTH_GENERICO) {
  const message = (error?.message || '').toLowerCase()
  const code = (error?.code || '').toLowerCase()

  if (
    message.includes('email not confirmed') ||
    code === 'email_not_confirmed'
  ) {
    return new Error(MENSAJE_EMAIL_NO_CONFIRMADO)
  }

  if (
    message.includes('invalid login credentials') ||
    code === 'invalid_credentials'
  ) {
    return new Error(MENSAJE_LOGIN_INVALIDO)
  }

  if (
    message.includes('user already registered') ||
    message.includes('already been registered') ||
    code === 'user_already_exists'
  ) {
    return new Error(MENSAJE_EMAIL_YA_REGISTRADO)
  }

  if (
    message.includes('invalid email') ||
    code === 'email_address_invalid'
  ) {
    return new Error(MENSAJE_EMAIL_INVALIDO)
  }

  if (message.includes('supabase no esta configurado')) {
    return new Error(MENSAJE_SUPABASE_NO_CONFIGURADO)
  }

  if (
    message.includes('signups not allowed') ||
    code === 'signup_disabled'
  ) {
    return new Error(MENSAJE_REGISTRO_NO_DISPONIBLE)
  }

  if (message.includes('password') && message.includes('least')) {
    return new Error(MENSAJE_PASSWORD_INVALIDA)
  }

  if (
    message.includes('email rate limit exceeded') ||
    message.includes('rate limit') ||
    code === 'over_email_send_rate_limit'
  ) {
    return new Error(MENSAJE_RATE_LIMIT_EMAIL)
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
