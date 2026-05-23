// useCameraCheck.js — STUB (RR-003)
// Implementation: see SDD GO1 / GO4 module for spec.
import { useState, useEffect, useRef } from 'react'

const WASM_TIMEOUT_MS = 10000
const CENTER_TOLERANCE = 0.25
const YAW_THRESHOLD = 0.30

export function useCameraCheck(videoElement) {
  const [cameraStatus, setCameraStatus] = useState('CHECKING')
  const [message, setMessage] = useState('Initializing camera check...')
  const faceMeshRef = useRef(null)
  const timeoutRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    if (!videoElement) return
    mountedRef.current = true

    async function init() {
      // Auto-pass fallback if WASM doesn't load in time
      timeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return
        console.warn('[GO1] MediaPipe WASM failed to load — camera check auto-passed')
        setCameraStatus('PASS')
        setMessage('Camera: Ready')
      }, WASM_TIMEOUT_MS)

      try {
        const { FaceMesh } = await import('@mediapipe/face_mesh')

        if (!mountedRef.current) return
        clearTimeout(timeoutRef.current)

        const faceMesh = new FaceMesh({
          locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        })

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
        })

        faceMesh.onResults((results) => {
          if (!mountedRef.current) return

          if (!results.multiFaceLandmarks?.length) {
            setCameraStatus('FAIL')
            setMessage('No face detected. Please position your face in front of the camera.')
            return
          }

          const landmarks = results.multiFaceLandmarks[0]
          const nose = landmarks[1]
          const leftEye = landmarks[33]
          const rightEye = landmarks[263]

          // Check if face is centered horizontally
          const faceCenterX = (leftEye.x + rightEye.x) / 2
          const isCentered = Math.abs(faceCenterX - 0.5) < CENTER_TOLERANCE

          // Check yaw by comparing eye x positions (normalized 0-1)
          const yaw = Math.abs(leftEye.x - rightEye.x)
          const isLevel = yaw > YAW_THRESHOLD // eyes too close = extreme angle

          if (!isCentered || !isLevel) {
            setCameraStatus('FAIL')
            setMessage('Please center your face and hold the device at eye level.')
            return
          }

          setCameraStatus('PASS')
          setMessage('Camera: Ready')
        })

        faceMeshRef.current = faceMesh

        // Feed frames to MediaPipe
        async function detectLoop() {
          if (!mountedRef.current) return
          if (videoElement.readyState >= 2) {
            await faceMesh.send({ image: videoElement })
          }
          requestAnimationFrame(detectLoop)
        }
        detectLoop()

      } catch (err) {
        if (!mountedRef.current) return
        clearTimeout(timeoutRef.current)
        console.warn('[GO1] MediaPipe failed to load — camera check auto-passed', err)
        setCameraStatus('PASS')
        setMessage('Camera: Ready')
      }
    }

    init()

    return () => {
      mountedRef.current = false
      clearTimeout(timeoutRef.current)
      faceMeshRef.current?.close()
    }
  }, [videoElement])

  return { cameraStatus, message }
}