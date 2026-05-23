// useMicCheck.js — STUB (RR-003)
// Implementation: see SDD GO1 / GO4 module for spec.
import { useState, useEffect, useRef } from 'react'

const RMS_MIN = 10
const RMS_MAX = 100

export function useMicCheck(audioTrack) {
  const [micStatus, setMicStatus] = useState('CHECKING')
  const [message, setMessage] = useState('Checking your microphone...')
  const animFrameRef = useRef(null)
  const audioCtxRef = useRef(null)

  useEffect(() => {
    if (!audioTrack) return

    const stream = new MediaStream([audioTrack])
    const audioCtx = new AudioContext()
    audioCtxRef.current = audioCtx

    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)

    const data = new Uint8Array(analyser.frequencyBinCount)

    function check() {
      analyser.getByteTimeDomainData(data)
      const rms = Math.sqrt(
        data.reduce((sum, v) => sum + (v - 128) ** 2, 0) / data.length
      )

      if (rms < RMS_MIN) {
        setMicStatus('FAIL')
        setMessage('Your microphone is too quiet. Please speak up or move closer to the device.')
      } else if (rms > RMS_MAX) {
        setMicStatus('FAIL')
        setMessage('Your microphone is too loud. Please move a little further from the device.')
      } else {
        setMicStatus('PASS')
        setMessage('Optimal levels detected')
      }

      animFrameRef.current = requestAnimationFrame(check)
    }

    animFrameRef.current = requestAnimationFrame(check)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      audioCtx.close()
    }
  }, [audioTrack])

  return { micStatus, message }
}