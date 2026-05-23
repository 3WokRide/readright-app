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
 * permissionStatus:
 *   'pending'    — explanation shown, awaiting the learner's tap
 *   'requesting' — getUserMedia in flight (native prompt open)
 *   'granted'    — stream active, preview can render
 *   'denied'     — acquisition failed; recovery screen shown (see errorKind)
 */

const GUM_CONSTRAINTS = {
  audio: true,
  video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
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
  const [permissionStatus, setPermissionStatus] = useState('pending')
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

  const requestStream = useCallback(async () => {
    // Idempotent: ignore taps while a request is in flight or already granted.
    if (requestingRef.current || streamRef.current) return

    // Insecure origins (and very old browsers) expose no mediaDevices at all.
    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorKind('insecure')
      setPermissionStatus('denied')
      return
    }

    requestingRef.current = true
    setErrorKind(null)
    setPermissionStatus('requesting')

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

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopStream(streamRef.current)
      streamRef.current = null
    }
  }, [stopStream])

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
