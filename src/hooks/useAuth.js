import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useAuth — single source of truth for Supabase Auth state (RR-010, UC-1.1).
 *
 * Subscribes to supabase.auth.onAuthStateChange so the rest of the app can
 * react to sign-in / sign-out / token-refresh events without polling. The
 * Supabase SDK is configured with persistSession: false (SRS NFR-S3), so the
 * JWT lives in memory only — this hook NEVER writes the token to localStorage,
 * sessionStorage, or any cookie.
 *
 * Returns
 * -------
 *   session  {object|null}  Raw Supabase session (null when signed out).
 *   user     {object|null}  Convenience accessor for session.user.
 *   signIn   {function}     ({ email, password }) → Promise<{ error }>.
 *   loading  {boolean}      True until the first auth event fires, preventing
 *                           a flash of unauthenticated UI on page load.
 *   signOut  {function}     () → Promise; clears the in-memory session.
 *
 * Consumed once by AuthContext, which fans the value out to the whole app.
 */
export function useAuth() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // onAuthStateChange fires an initial event synchronously after subscribe,
    // which both seeds the current session and flips loading off.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  function signOut() {
    return supabase.auth.signOut()
  }

  return { session, user: session?.user ?? null, signIn, loading, signOut }
}
