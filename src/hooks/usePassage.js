/**
 * usePassage
 *
 * Loads the reading passages from Supabase (the single source of truth — see
 * lib/supabase.js → fetchPassages) and picks one at random for this session.
 * Replaces the old hardcoded `src/data/passages.js` bank.
 *
 * Mirrors the GO1 check hooks' lib/hook split: the network call is the pure
 * `fetchPassages` in lib/, this hook owns the React state and lifecycle. The
 * passage is chosen once per mount; `retry()` re-fetches (and re-picks) so a
 * failed load gives the learner a recovery action.
 *
 * Returns
 * -------
 *   passage  {object|null}  { id, text, wordCount } once loaded, else null.
 *   loading  {boolean}      True while the fetch is in-flight.
 *   error    {Error|null}   Set when the fetch fails or the table is empty.
 *   retry    {function}     Re-runs the fetch + random pick.
 */
import { useCallback, useEffect, useState } from 'react'
import { fetchPassages } from '../lib/supabase'

export function usePassage() {
  const [passage, setPassage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const passages = await fetchPassages()
        if (cancelled) return
        if (passages.length === 0) {
          setError(new Error('No passages available'))
          setPassage(null)
        } else {
          setPassage(passages[Math.floor(Math.random() * passages.length)])
        }
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return { passage, loading, error, retry }
}
