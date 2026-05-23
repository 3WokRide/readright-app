// platform.js — coarse mobile-OS detection for device-specific UI copy.
//
// Used by the GO1 permission-recovery screen (PermissionDenied) to show the
// correct "re-enable camera & microphone" steps for iOS Safari vs Android
// Chrome. This is best-effort UA sniffing — acceptable here because it only
// selects help text, never gates functionality.

/**
 * @returns {'ios' | 'android' | 'other'}
 */
export function detectPlatform() {
  if (typeof navigator === 'undefined') return 'other'

  const ua = navigator.userAgent || ''

  // iPadOS 13+ reports a desktop Safari UA ("Macintosh"), so fall back to the
  // touch-points heuristic to still recognise it as iOS.
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  if (isIOS) return 'ios'

  if (/Android/.test(ua)) return 'android'

  return 'other'
}
