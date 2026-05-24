import { useMicCheck } from './useMicCheck'
import { useNoiseCheck } from './useNoiseCheck'
import { useLightingCheck } from './useLightingCheck'
import { useCameraCheck } from './useCameraCheck'

/**
 * useQualityGate — aggregates the four GO1 checks into a single gate (RR-003 · GO1).
 *
 * Composes the audio checks (mic, ambient noise — driven by the audio track) and
 * the video checks (lighting, camera angle — driven by the <video> element).
 * `allPassed` is true only when every check is 'PASS'. Each check keeps its own
 * uniform { status, message } shape so the results map generically.
 *
 * @param {object} params
 * @param {MediaStreamTrack|null} params.audioTrack
 * @param {HTMLVideoElement|null} params.videoElement
 * @returns {{
 *   allPassed: boolean,
 *   checks: {
 *     mic:      { status: string, message: string },
 *     noise:    { status: string, message: string },
 *     lighting: { status: string, message: string },
 *     camera:   { status: string, message: string },
 *   }
 * }}
 */
export function useQualityGate({ audioTrack, videoElement }) {
  const mic = useMicCheck(audioTrack)
  const noise = useNoiseCheck(audioTrack)
  const lighting = useLightingCheck(videoElement)
  const camera = useCameraCheck(videoElement)

  const checks = { mic, noise, lighting, camera }
  const allPassed = Object.values(checks).every((c) => c.status === 'PASS')

  return { allPassed, checks }
}
