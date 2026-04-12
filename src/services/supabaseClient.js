import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

const MISSING_ENV_MESSAGE =
	'Supabase no esta configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local y reinicia Vite.'

function authUnavailableError() {
	return new Error(MISSING_ENV_MESSAGE)
}

if (!isSupabaseConfigured) {
	console.warn(MISSING_ENV_MESSAGE)
}

export const supabase = isSupabaseConfigured
	? createClient(supabaseUrl, supabaseAnonKey)
	: {
			auth: {
				getSession: async () => ({ data: { session: null }, error: null }),
				onAuthStateChange: () => ({
					data: {
						subscription: {
							unsubscribe: () => {}
						}
					}
				}),
				signUp: async () => ({ data: null, error: authUnavailableError() }),
				signInWithPassword: async () => ({ data: null, error: authUnavailableError() }),
				signOut: async () => ({ error: null })
			}
		}