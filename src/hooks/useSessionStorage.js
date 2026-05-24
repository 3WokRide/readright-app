import { useEffect, useRef, useState } from 'react'
import { saveSessionRecord } from '../lib/supabase'

/**
 * useSessionStorage — persists one completed session to Supabase (RR-041 · REA-26).
 *
 * Wraps the pure saveSessionRecord (lib/supabase.js, which owns the INSERT and
 * the 3x exponential-backoff retry) with the React-side concerns: a once-guard
 * so StrictMode's double-invoked effect can't INSERT twice, and a status the
 * results page can switch on. The save never blocks rendering — results show
 * regardless of the outcome (NFR-R1).
 *
 * Runs once, when both `result` and `passageId` are first available.
 *
 * saveStatus: 'idle' | 'saved' | 'failed'
 *   'idle' covers both "not started" and "in flight" — the results page only
 *   needs to react to 'failed' (to show the banner), and we set status only from
 *   the async resolution to avoid a synchronous setState in the effect body
 *   (react-hooks/set-state-in-effect).
 *
 * @param {object|null} result    — AssessmentResultJSON
 * @param {string|null} passageId
 * @returns {{ saveStatus: 'idle'|'saved'|'failed' }}
 */
export function useSessionStorage(result, passageId) {
  const [saveStatus, setSaveStatus] = useState('idle')
  const savedRef = useRef(false)

  useEffect(() => {
    if (!result || !passageId || savedRef.current) return
    savedRef.current = true
    saveSessionRecord(result, passageId).then(({ success }) =>
      setSaveStatus(success ? 'saved' : 'failed'),
    )
  }, [result, passageId])

  return { saveStatus }
}
