import { useCallback, useEffect, useRef, useState } from 'react'
import { submitRecording } from '../lib/api'

/**
 * useAnalyzeSubmit — the FastAPI /analyze state machine (REA-34 · RR-050).
 *
 * Wraps the pure `submitRecording` fetch (lib/api.js) with the React-side
 * concerns it needs: an AbortController, a 120s timeout, abort-on-unmount, and
 * a status state machine the UI can switch on. The network call itself stays in
 * lib/api.js so it remains framework-agnostic and testable.
 *
 * status: 'idle' | 'submitting' | 'success' | 'error' | 'timeout'
 *   - 'timeout' is reported separately from 'error' so the UI can show specific,
 *     recovery-oriented copy (CLAUDE.md error rules) instead of one generic message.
 *
 * @returns {{
 *   status: 'idle'|'submitting'|'success'|'error'|'timeout',
 *   result: object|null,           // AssessmentResultJSON on success
 *   error: Error|null,             // the thrown error on 'error'
 *   submit: (file: File|Blob, passageId: string) => Promise<object|null>,
 *   reset: () => void,             // back to 'idle' before a fresh take
 * }}
 */

const TIMEOUT_MS = 120_000

export function useAnalyzeSubmit() {
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const controllerRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      controllerRef.current?.abort() // cancel an in-flight request on unmount
    }
  }, [])

  const submit = useCallback(async (file, passageId) => {
    setStatus('submitting')
    setError(null)
    setResult(null)

    const controller = new AbortController()
    controllerRef.current = controller
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

    try {
      const data = await submitRecording(file, passageId, { signal: controller.signal })
      clearTimeout(timeoutId)
      if (!mountedRef.current) return null
      setResult(data)
      setStatus('success')
      return data
    } catch (err) {
      clearTimeout(timeoutId)
      if (!mountedRef.current) return null
      if (err.name === 'AbortError') {
        setStatus('timeout')
      } else {
        setError(err)
        setStatus('error')
      }
      return null
    } finally {
      controllerRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }, [])

  return { status, result, error, submit, reset }
}
