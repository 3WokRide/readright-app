import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * useMediaStream — acquires and OWNS the single combined audio+video stream
 * used throughout a reading session (GO1 quality checks + recording).
 *
 * Layering (see ARCHITECTURE.md). This hook is the *acquisition + permission +
 * lifecycle* layer:
 *   - It is the ONLY place that calls getUserMedia.
 *   - It is the ONLY place that stops tracks.
 *   - useMediaRecorder and the four GO1 check hooks (useCameraCheck /
 *     useMicCheck / useNoiseCheck / useLightingCheck) are *consumers* of the
 *     stream this hook produces — they must never call getUserMedia or stop a
 *     track.
 *
 * The native browser permission prompt only fires from requestStream(), which
 * the UI triggers from the in-app explanation screen after a learner tap. That
 * guarantees our plain-language explanation shows BEFORE the native prompt.
 *
 * On mount we first probe the Permissions API: if camera AND microphone are
 * ALREADY granted (from a prior visit), no native prompt can appear, so we
 * silently acquire the stream and skip the explanation gate entirely — staying
 * in 'checking' until the stream resolves rather than flashing 'requesting'.
 *
 * permissionStatus:
 *   'checking'   — probing existing permission on mount (and silently acquiring
 *                  if already granted); a brief, neutral state
 *   'pending'    — not pre-granted; explanation shown, awaiting the learner's tap
 *   'requesting' — getUserMedia in flight AFTER a learner tap (native prompt open)
 *   'granted'    — stream active, preview can render
 *   'denied'     — acquisition failed; recovery screen shown (see errorKind)
 */

const GUM_CONSTRAINTS = {
  audio: true,
  video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
}

// Probe whether camera AND microphone are already granted, WITHOUT triggering a
// native prompt. Returns true only when confident: Firefox throws TypeError for
// these permission names and Safari may lack the API entirely — in every
// uncertain case we return false so the flow falls back to the explanation gate.
async function probeBothGranted() {
  if (!navigator.permissions?.query) return false
  try {
    const [cam, mic] = await Promise.all([
      navigator.permissions.query({ name: 'camera' }),
      navigator.permissions.query({ name: 'microphone' }),
    ])
    return cam.state === 'granted' && mic.state === 'granted'
  } catch {
    return false
  }
}

// Map a getUserMedia rejection to a stable, jargon-free category the recovery
// screen can switch on. The raw DOMException never leaves this hook.
function classifyError(err) {
  switch (err?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'permission'
    case 'NotFoundError':
    case 'OverconstrainedError':
      return 'notfound'
    case 'NotReadableError':
    case 'TrackStartError':
    case 'AbortError':
      return 'inuse'
    default:
      return 'unknown'
  }
}

export function useMediaStream() {
  const [stream, setStream] = useState(null)
  const [permissionStatus, setPermissionStatus] = useState('checking')
  const [errorKind, setErrorKind] = useState(null)

  // Cleanup must read the *current* stream, not a stale render closure.
  const streamRef = useRef(null)
  const mountedRef = useRef(true)
  const requestingRef = useRef(false)

  const stopStream = useCallback((s) => {
    s?.getTracks().forEach((t) => {
      t.onended = null
      t.stop()
    })
  }, [])

  // Acquire the stream. `pendingState` is the status to show while getUserMedia
  // is in flight: 'requesting' for the learner-tap path (drives the explainer's
  // "Asking…"), or 'checking' for the silent pre-granted path (no UI change).
  const acquire = useCallback(async (pendingState) => {
    // Idempotent: ignore calls while a request is in flight or already granted.
    if (requestingRef.current || streamRef.current) return

    // Insecure origins (and very old browsers) expose no mediaDevices at all.
    if (!navigator.mediaDevices?.getUserMedia) {
      if (!mountedRef.current) return
      setErrorKind('insecure')
      setPermissionStatus('denied')
      return
    }

    requestingRef.current = true
    setErrorKind(null)
    setPermissionStatus(pendingState)

    try {
      const s = await navigator.mediaDevices.getUserMedia(GUM_CONSTRAINTS)

      // Resolved after unmount — discard the stream immediately so the camera
      // light doesn't stay on.
      if (!mountedRef.current) {
        stopStream(s)
        return
      }

      // Camera revoked / unplugged mid-session → drop back to the recovery
      // screen instead of silently freezing the preview.
      const videoTrack = s.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.onended = () => {
          if (!mountedRef.current) return
          stopStream(streamRef.current)
          streamRef.current = null
          setStream(null)
          setErrorKind('inuse')
          setPermissionStatus('denied')
        }
      }

      streamRef.current = s
      setStream(s)
      setPermissionStatus('granted')
    } catch (err) {
      if (!mountedRef.current) return
      setErrorKind(classifyError(err))
      setPermissionStatus('denied')
    } finally {
      requestingRef.current = false
    }
  }, [stopStream])

  // Public entry point: only fires after a learner tap, so it shows 'requesting'
  // (and therefore the native prompt) — preserving explanation-before-prompt.
  const requestStream = useCallback(() => acquire('requesting'), [acquire])

  useEffect(() => {
    mountedRef.current = true
    let cancelled = false

    // On mount, probe existing permission. If already granted, acquire silently
    // (stay in 'checking' until granted/denied); otherwise show the explanation.
    ;(async () => {
      const pre = await probeBothGranted()
      if (cancelled || !mountedRef.current) return
      if (pre) acquire('checking')
      else setPermissionStatus('pending')
    })()

    return () => {
      cancelled = true
      mountedRef.current = false
      stopStream(streamRef.current)
      streamRef.current = null
    }
  }, [acquire, stopStream])

  // Derived so they can never go stale relative to `stream`.
  const audioTrack = useMemo(() => stream?.getAudioTracks()[0] ?? null, [stream])
  const videoTrack = useMemo(() => stream?.getVideoTracks()[0] ?? null, [stream])

  return {
    stream,
    audioTrack,
    videoTrack,
    permissionStatus,
    errorKind,
    requestStream,
    retry: requestStream,
  }
}
