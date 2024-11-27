import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const debugAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Current session:', session)
  if (session?.access_token) {
    console.log('JWT token:', session.access_token)
  }
}
