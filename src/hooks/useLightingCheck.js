// useLightingCheck.js — STUB (RR-003)
// Implementation: see SDD GO1 / GO4 module for spec.
import { useState, useEffect, useRef } from 'react'

const LUMINANCE_THRESHOLD = 80
const SAMPLE_INTERVAL_MS = 500
const CANVAS_W = 160
const CANVAS_H = 120

export function useLightingCheck(videoElement) {
  const [lightingStatus, setLightingStatus] = useState('CHECKING')
  const [message, setMessage] = useState('Checking lighting...')
  const intervalRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!videoElement) return

    const canvas = document.createElement('canvas')
    canvas.width = CANVAS_W
    canvas.height = CANVAS_H
    canvasRef.current = canvas
    const ctx = canvas.getContext('2d')

    function checkLighting() {
      if (videoElement.readyState < 2) return // video not ready yet

      ctx.drawImage(videoElement, 0, 0, CANVAS_W, CANVAS_H)
      const pixels = ctx.getImageData(0, 0, CANVAS_W, CANVAS_H).data

      let totalLum = 0
      for (let i = 0; i < pixels.length; i += 4) {
        totalLum += 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
      }
      const avgLum = totalLum / (pixels.length / 4)

      if (avgLum >= LUMINANCE_THRESHOLD) {
        setLightingStatus('PASS')
        setMessage('Lighting looks good')
      } else {
        setLightingStatus('FAIL')
        setMessage('Your face is too dark. Please move to a brighter area or turn on a light.')
      }
    }

    checkLighting()
    intervalRef.current = setInterval(checkLighting, SAMPLE_INTERVAL_MS)

    return () => {
      clearInterval(intervalRef.current)
    }
  }, [videoElement])

  return { lightingStatus, message }
}
