import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useCurrentUser — resolves the signed-in Supabase user and derives the
 * display name + avatar initial used by the header and profile card.
 *
 * Re-fetches on mount; getUser() resolves from the persisted session, so it
 * works after a reload. Falls back to 'Learner' when no session/display_name
 * is present.
 */
export function useCurrentUser() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
  }, [])

  const displayName =
    user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'Learner'
  const initial = displayName.charAt(0).toUpperCase()

  return { user, displayName, initial }
}
