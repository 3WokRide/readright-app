import { useEffect, useRef } from 'react'

/**
 * useOnClickOutside — calls `onDismiss` when a pointer lands outside the
 * element held by `ref`, or when Escape is pressed. Used to close transient
 * overlays such as the profile menu.
 *
 * Follows the repo convention that a hook owns its event listeners and removes
 * them on cleanup. `onDismiss` is read through a ref so callers can pass an
 * inline arrow without re-subscribing on every render. Pass `enabled = false`
 * (e.g. while the overlay is closed) to skip attaching the global listeners.
 */
export function useOnClickOutside(ref, onDismiss, enabled = true) {
  // Keep the latest handler in a ref, updated in an effect (never during
  // render — react-hooks/refs), so the listener effect needn't re-subscribe
  // when callers pass an inline arrow.
  const handlerRef = useRef(onDismiss)
  useEffect(() => {
    handlerRef.current = onDismiss
  })

  useEffect(() => {
    if (!enabled) return

    function onPointer(e) {
      const el = ref.current
      if (el && !el.contains(e.target)) handlerRef.current(e)
    }
    function onKey(e) {
      if (e.key === 'Escape') handlerRef.current(e)
    }

    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [ref, enabled])
}
