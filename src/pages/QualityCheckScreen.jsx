import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMediaStream } from '../hooks/useMediaStream'
import { useMicCheck } from '../hooks/useMicCheck'
import { useNoiseCheck } from '../hooks/useNoiseCheck'
import { useLightingCheck } from '../hooks/useLightingCheck'
import { useCameraCheck } from '../hooks/useCameraCheck'
import { detectPlatform } from '../utils/platform'
import { PermissionDenied } from '../components/quality/PermissionDenied'

const RED = '#C0392B'
const GREEN = '#2D6A4F'
const GREEN_LIGHT = '#E8F5EF'
const RED_LIGHT = '#F9ECEB'
const BEIGE = '#FAF3EE'
const TEXT = '#1A1008'
const TEXT_MUTED = '#8B7355'
const BORDER = '#E8DDD4'

const ONBOARDING_TOOLTIPS = {
  mic: 'Voice needs to be clear enough to analyse',
  noise: 'A quiet room gives the AI a better result',
  lighting: 'Good lighting helps us see your reading habits',
  camera: 'We need to see your face to check your reading posture',
}

function CheckIndicator({ icon, label, status, message, tooltip }) {
  const pass = status === 'PASS'
  const fail = status === 'FAIL'

  return (
    <div style={{
      background: pass ? GREEN_LIGHT : fail ? RED_LIGHT : '#F5F0EC',
      border: `1px solid ${pass ? '#C0DDD0' : fail ? '#F0C8C4' : BORDER}`,
      borderRadius: 12,
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10,
      height: 90,
      boxSizing: 'border-box',
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT, fontFamily: 'system-ui, sans-serif' }}>{label}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: pass ? GREEN : fail ? RED : TEXT_MUTED, fontFamily: 'system-ui, sans-serif' }}>
            {pass ? '✓ PASS' : fail ? '✗ FAIL' : '...'}
          </span>
        </div>
        <p style={{
          fontSize: 12,
          color: pass ? GREEN : fail ? RED : TEXT_MUTED,
          margin: '4px 0 0',
          fontFamily: 'system-ui, sans-serif',
          lineHeight: 1.4,
          height: '2.8em',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {status === 'CHECKING' ? tooltip : message}
        </p>
      </div>
    </div>
  )
}

export default function QualityCheckScreen() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const platform = useMemo(() => detectPlatform(), [])
  const { stream, audioTrack, permissionStatus, errorKind, requestStream, retry } = useMediaStream()

  const { micStatus, message: micMsg } = useMicCheck(audioTrack)
  const { noiseStatus, message: noiseMsg } = useNoiseCheck(audioTrack)
  const { lightingStatus, message: lightingMsg } = useLightingCheck(videoRef.current)
  const { cameraStatus, message: cameraMsg } = useCameraCheck(videoRef.current)

  const allPassed = [micStatus, noiseStatus, lightingStatus, cameraStatus].every(s => s === 'PASS')

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch(() => {})
    }
  }, [stream])

  // Acquisition failed (denied / device in use / unplugged) → device-specific
  // recovery steps, matching SessionScreen rather than the bare Enable button.
  if (permissionStatus === 'denied') {
    return <PermissionDenied platform={platform} errorKind={errorKind} onRetry={retry} />
  }

  // Auto-navigate to session when all pass and user taps record
  function handleRecord() {
    if (!allPassed) return
    navigate('/session', { state: { isFirstSession: !localStorage.getItem('rr_onboarding_seen') } })
  }

  const checks = [
    { key: 'mic', icon: '🎤', label: 'Microphone', status: micStatus, message: micMsg, tooltip: ONBOARDING_TOOLTIPS.mic },
    { key: 'noise', icon: '🔊', label: 'Ambient Noise', status: noiseStatus, message: noiseMsg, tooltip: ONBOARDING_TOOLTIPS.noise },
    { key: 'lighting', icon: '☀️', label: 'Lighting', status: lightingStatus, message: lightingMsg, tooltip: ONBOARDING_TOOLTIPS.lighting },
    { key: 'camera', icon: '👤', label: 'Camera Angle', status: cameraStatus, message: cameraMsg, tooltip: ONBOARDING_TOOLTIPS.camera },
  ]

  return (
    <div style={{ minHeight: '100vh', background: BEIGE, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', fontFamily: "'Georgia', serif" }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: RED, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>R</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: TEXT }}>ReadRight</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: TEXT_MUTED, fontFamily: 'system-ui, sans-serif' }}>SESSION CHECK</span>
      </header>

      <div style={{ flex: 1, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ textAlign: 'center', fontSize: 15, color: TEXT_MUTED, margin: 0, fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}>
          Let's make sure everything is ready before you read.
        </p>

        {/* Camera preview */}
        <div style={{ borderRadius: 16, overflow: 'hidden', background: '#111', aspectRatio: '4/3', position: 'relative' }}>
          {permissionStatus === 'pending' ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
              <button
                onClick={requestStream}
                style={{ padding: '10px 20px', background: RED, color: '#fff', border: 'none', borderRadius: 20, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'system-ui, sans-serif' }}
              >
                Enable Camera & Mic
              </button>
            </div>
        ) : permissionStatus !== 'granted' ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)', fontFamily: 'system-ui, sans-serif' }}>
                Preparing camera…
              </span>
            </div>
        ) : (
        <>
            <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
            />
            <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            width: '45%',
            aspectRatio: '3/4',
            border: '2.5px dashed rgba(255,255,255,0.6)',
            borderRadius: '50%',
            pointerEvents: 'none',
            }} />
        </>
        )}
          <p style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
            Center your face in the guide
          </p>
        </div>

        {/* 2x2 check grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {checks.map(c => <CheckIndicator key={c.key} {...c} />)}
        </div>

        <div style={{
            background: '#FEF9F0',
            border: '1px solid #F0DFC0',
            borderRadius: 10,
            padding: '12px 14px',
            display: 'flex',
            gap: 10,
            visibility: allPassed ? 'hidden' : 'visible',  // ← keeps space, just hides
        }}>
        <span style={{ fontSize: 16 }}>ℹ️</span>
        <p style={{ fontSize: 13, color: TEXT, margin: 0, lineHeight: 1.5, fontFamily: 'system-ui, sans-serif' }}>
            Point your camera straight at your face and hold the phone at eye level. Make sure there's enough light in the room!
        </p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: TEXT_MUTED, margin: 0, fontFamily: 'system-ui, sans-serif' }}>
          All checks must pass before you can record.
        </p>
      </div>

      <div style={{ padding: '12px 16px 32px' }}>
        <button
          onClick={handleRecord}
          disabled={!allPassed}
          aria-disabled={!allPassed}
          style={{
            width: '100%',
            padding: 16,
            background: allPassed ? RED : '#D9C5B8',
            color: '#fff',
            border: 'none',
            borderRadius: 50,
            fontSize: 17,
            fontWeight: 700,
            cursor: allPassed ? 'pointer' : 'not-allowed',
            fontFamily: 'system-ui, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
          Start Recording
        </button>
      </div>
    </div>
  )
}