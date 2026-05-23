import { useEffect, useRef } from 'react'

/**
 * CameraPreview — live, self-view (mirrored) camera feed for GO1.
 *
 * Pure consumer of the stream owned by useMediaStream: it attaches the stream
 * to a <video> for display only and never stops tracks.
 *
 * iOS Safari notes:
 *   - `playsInline` is required or Safari forces fullscreen playback.
 *   - `muted` is required for autoplay (and prevents echo from the live mic).
 *   - `srcObject` must be set imperatively — React can't set it via a prop.
 *   - play() must be called explicitly after setting srcObject.
 */
export function CameraPreview({ stream }) {
  const videoRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !stream) return

    video.srcObject = stream
    const playPromise = video.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      // Autoplay can be interrupted (e.g. a fast unmount). muted + playsInline
      // normally prevent a policy block, so just swallow the AbortError.
      playPromise.catch(() => {})
    }

    return () => {
      // Detach so the element releases its track references. Stopping the
      // tracks is useMediaStream's job, never ours.
      video.srcObject = null
    }
  }, [stream])

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      aria-label="Camera preview"
      className="w-full aspect-[4/3] rounded-[12px] object-cover -scale-x-100 bg-ink"
    />
  )
}
