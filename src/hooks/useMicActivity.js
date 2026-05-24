// useMicActivity.js — live mic monitoring during recording (RR-003 · GO4).
//
// Unlike useMicCheck (which latches PASS on the first loud sample to confirm the
// mic works on /quality-check), this hook keeps watching while the learner reads:
// it tracks the time since the last loud-enough sample and FAILs after a
// continuous silence window, so a recording where we can't hear the reader is
// caught in real time. The silence window lives here — not in a downstream grace
// timer — because silence is a duration, not an instantaneous state: normal
// reading has constant micro-pauses between words that would otherwise flap a
// grace timer and never accumulate.
import { useState, useEffect, useRef } from 'react'

const RMS_MIN = 10 // loud-enough floor (matches useMicCheck)
const RMS_MAX = 100 // clipping ceiling (matches useMicCheck)
const MIC_SILENCE_MS = 10000 // continuous silence before FAIL

export function useMicActivity(audioTrack) {
  const [state, setState] = useState({ status: 'CHECKING', message: 'Listening for your voice...' })
  const animFrameRef = useRef(null)
  const lastLoudRef = useRef(0)
  // Mirror of `state` so the RAF loop can publish only on a real change. The loop
  // runs ~60fps; a fresh object every frame would re-render SessionScreen 60×/s.
  const stateRef = useRef(state)

  useEffect(() => {
    if (!audioTrack) return
    lastLoudRef.current = Date.now() // grace from start; don't fail instantly

    const stream = new MediaStream([audioTrack])
    const audioCtx = new AudioContext()
    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 256
    source.connect(analyser)

    const data = new Uint8Array(analyser.frequencyBinCount)

    function publish(status, message) {
      const prev = stateRef.current
      if (prev.status === status && prev.message === message) return
      const next = { status, message }
      stateRef.current = next
      setState(next)
    }

    publish('CHECKING', 'Listening for your voice...') // reset on (re-)activation

    function check() {
      analyser.getByteTimeDomainData(data)
      const rms = Math.sqrt(
        data.reduce((sum, v) => sum + (v - 128) ** 2, 0) / data.length
      )
      const now = Date.now()

      if (rms > RMS_MAX) {
        publish('FAIL', 'Your microphone is too loud. Please move a little further from the device.')
      } else if (rms >= RMS_MIN) {
        lastLoudRef.current = now
        publish('PASS', 'We can hear you reading.')
      } else if (now - lastLoudRef.current > MIC_SILENCE_MS) {
        publish('FAIL', "We can't hear your reading. Please read aloud a little louder.")
      }
      // else: a brief pause within the window — leave the status as-is.

      animFrameRef.current = requestAnimationFrame(check)
    }

    animFrameRef.current = requestAnimationFrame(check)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      audioCtx.close()
    }
  }, [audioTrack])

  return state
}
