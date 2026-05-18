import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnon) {
  throw new Error(
    '[ReadRight] Missing Supabase env vars. ' +
    'Copy .env.example → .env.local and fill in your values from RR-001.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnon, {
  auth: {
    // SRS NFR-S3: JWTs must NOT persist to localStorage/sessionStorage.
    // The Supabase SDK keeps the token in memory only.
    persistSession: false,
    autoRefreshToken: true,   // Required by SRS NFR-S3
    detectSessionInUrl: false,
  },
})
