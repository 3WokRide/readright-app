// useNoiseCheck.js — STUB (RR-003)
// Implementation: see SDD GO1 / GO4 module for spec.
import { useState, useEffect, useRef } from 'react'

const NOISE_THRESHOLD = 30
const SAMPLE_INTERVAL_MS = 2000
const SAMPLE_DURATION_MS = 300
const SAMPLE_COUNT = 5

export function useNoiseCheck(audioTrack) {
  const [noiseStatus, setNoiseStatus] = useState('CHECKING')
  const [message, setMessage] = useState('Checking your environment...')
  const audioCtxRef = useRef(null)
  const intervalRef = useRef(null)

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

    function getRMS() {
      analyser.getByteTimeDomainData(data)
      return Math.sqrt(
        data.reduce((sum, v) => sum + (v - 128) ** 2, 0) / data.length
      )
    }

    async function sampleNoiseFloor() {
      // Take multiple samples spaced apart and use the minimum
      // to avoid false FAILs when the learner is speaking
      const samples = []
      for (let i = 0; i < SAMPLE_COUNT; i++) {
        await new Promise(r => setTimeout(r, SAMPLE_DURATION_MS / SAMPLE_COUNT))
        samples.push(getRMS())
      }
      const noiseFloor = Math.min(...samples)

      if (noiseFloor < NOISE_THRESHOLD) {
        setNoiseStatus('PASS')
        setMessage('Environment is quiet')
      } else {
        setNoiseStatus('FAIL')
        setMessage('Your surroundings are too noisy. Please move to a quieter area.')
      }
    }

    sampleNoiseFloor()
    intervalRef.current = setInterval(sampleNoiseFloor, SAMPLE_INTERVAL_MS)

    return () => {
      clearInterval(intervalRef.current)
      audioCtx.close()
    }
  }, [audioTrack])

  return { noiseStatus, message }
}