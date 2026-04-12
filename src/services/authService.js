import { isSupabaseConfigured, supabase } from './supabaseClient'

const MENSAJE_LOGIN_INVALIDO = 'Correo o contrasena incorrectos.'
const MENSAJE_AUTH_GENERICO = 'No fue posible autenticarte. Intenta nuevamente.'
const MENSAJE_PASSWORD_INVALIDA = 'La nueva contrasena no cumple la politica minima.'
const MENSAJE_SUPABASE_NO_CONFIGURADO = 'Modo demo activo: configura Supabase para autenticar usuarios.'
const EMAIL_REGEX = /\S+@\S+\.\S+/

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
    return new Error(MENSAJE_SUPABASE_NO_CONFIGURADO)
  }

  if (message.includes('password') && message.includes('least')) {
    return new Error(MENSAJE_PASSWORD_INVALIDA)
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

async function guardarPerfilEnTabla({ userId, nombre, email }) {
  const payload = { id: userId, nombre, email }

  const { data: perfilActualizado, error: updatePerfilError } = await supabase
    .from('perfiles')
    .update({ nombre: payload.nombre, email: payload.email })
    .eq('id', userId)
    .select('id')
    .maybeSingle()

  if (updatePerfilError) {
    throw new Error(updatePerfilError.message || 'No se pudo actualizar el perfil en la base de datos.')
  }

  if (!perfilActualizado) {
    const { error: insertPerfilError } = await supabase
      .from('perfiles')
      .insert(payload)

    if (insertPerfilError) {
      throw new Error(insertPerfilError.message || 'No se pudo crear el perfil en la base de datos.')
    }
  }
}

export async function actualizarPerfilUsuario({ nombre, email }) {
  if (!isSupabaseConfigured) {
    throw new Error(MENSAJE_SUPABASE_NO_CONFIGURADO)
  }

  const nombreNormalizado = (nombre || '').trim()
  const emailNormalizado = (email || '').trim().toLowerCase()

  if (!nombreNormalizado) {
    throw new Error('El nombre es obligatorio.')
  }
  if (!emailNormalizado) {
    throw new Error('El correo es obligatorio.')
  }
  if (!EMAIL_REGEX.test(emailNormalizado)) {
    throw new Error('Correo no valido.')
  }

  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw mapAuthError(userError, 'No se pudo obtener la sesion del usuario.')

  const user = userData?.user
  if (!user?.id) {
    throw new Error('Sesion invalida. Inicia sesion nuevamente.')
  }

  const emailCambiado = emailNormalizado !== (user.email || '').toLowerCase()

  const updatePayload = {
    data: { ...user.user_metadata, nombre: nombreNormalizado }
  }

  if (emailCambiado) {
    updatePayload.email = emailNormalizado
  }

  const { data, error } = await supabase.auth.updateUser(updatePayload)

  if (error) throw mapAuthError(error, 'No se pudo actualizar el perfil.')

  await guardarPerfilEnTabla({
    userId: user.id,
    nombre: nombreNormalizado,
    email: emailNormalizado
  })

  return {
    ...data,
    perfil: {
      id: user.id,
      nombre: nombreNormalizado,
      email: emailNormalizado
    },
    emailPendienteConfirmacion: emailCambiado
  }
}

export async function cambiarContrasenaUsuario({ newPassword }) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw mapAuthError(error, MENSAJE_PASSWORD_INVALIDA)
  return data
}
