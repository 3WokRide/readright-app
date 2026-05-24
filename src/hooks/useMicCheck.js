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
  // Once we've heard clear input, the mic is confirmed on — PASS latches and
  // never reverts, so the learner can go quiet again without failing the check.
  const passedRef = useRef(false)

  useEffect(() => {
    if (!audioTrack) return
    passedRef.current = false // re-check whenever the track changes

    const stream = new MediaStream([audioTrack])
    const audioCtx = new AudioContext()
    audioCtxRef.current = audioCtx

    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)

    const data = new Uint8Array(analyser.frequencyBinCount)

    function check() {
      if (passedRef.current) return // already confirmed; stop sampling

      analyser.getByteTimeDomainData(data)
      const rms = Math.sqrt(
        data.reduce((sum, v) => sum + (v - 128) ** 2, 0) / data.length
      )

      if (rms > RMS_MAX) {
        setMicStatus('FAIL')
        setMessage('Your microphone is too loud. Please move a little further from the device.')
      } else if (rms >= RMS_MIN) {
        // Heard a clear sample in range — lock PASS and stop the loop.
        passedRef.current = true
        setMicStatus('PASS')
        setMessage('Microphone is working!')
        return
      } else {
        // Too quiet so far: not an error, just waiting to hear the learner.
        setMicStatus('CHECKING')
        setMessage('Say something so we can check your microphone.')
      }

      animFrameRef.current = requestAnimationFrame(check)
    }

    animFrameRef.current = requestAnimationFrame(check)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      audioCtx.close()
    }
  }, [audioTrack])

  return { status: micStatus, message }
}