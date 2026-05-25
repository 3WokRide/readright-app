import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMediaStream } from '../hooks/useMediaStream'
import { useQualityGate } from '../hooks/useQualityGate'
import { detectPlatform } from '../utils/platform'
import { PermissionDenied } from '../components/quality/PermissionDenied'
import ExitButton from '../components/ui/ExitButton'
import { LogoMark } from '../components/icons'

// CHECKING-state hints (plain language, learner-facing — CLAUDE.md no-jargon).
const ONBOARDING_TOOLTIPS = {
  mic: 'Say something so we can check your microphone',
  noise: 'A quiet room gives the AI a better result',
  camera: 'We need to see your face to check your reading posture',
  lighting: 'Good lighting helps us see your reading habits',
}

// Per-check line icons (inherit the icon-circle's text color via currentColor).
const ICONS = {
  mic: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  ),
  noise: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H2v6h4l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M19 5a9 9 0 0 1 0 14" />
    </svg>
  ),
  camera: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  lighting: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ),
}

const PillCheck = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 13 4 4L19 7" />
  </svg>
)
const PillX = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

// One GO1 check row — circular icon + label + status line + PASS/FAIL pill.
// State is shown with icon AND color AND text (never color alone — NFR-U1).
function CheckCard({ icon, label, status, message, tooltip }) {
  const pass = status === 'PASS'
  const fail = status === 'FAIL'
  return (
    <div className="flex items-center gap-3 rounded-[16px] border border-card-border bg-white px-4 py-3 shadow-card">
      <span
        className={`flex size-11 shrink-0 items-center justify-center rounded-full ${
          pass ? 'bg-goal/15 text-goal' : fail ? 'bg-brand/10 text-brand' : 'bg-stat text-ink-muted'
        }`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-bold text-ink">{label}</p>
        <p
          className={`truncate text-[13px] font-semibold ${
            pass ? 'text-goal' : fail ? 'text-brand' : 'text-ink-muted'
          }`}
        >
          {status === 'CHECKING' ? tooltip : message}
        </p>
      </div>
      <span
        className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[12px] font-extrabold tracking-[0.04em] ${
          pass ? 'bg-goal text-white' : fail ? 'bg-brand text-white' : 'bg-stat text-ink-muted'
        }`}
      >
        {pass ? <>{PillCheck} PASS</> : fail ? <>{PillX} FAIL</> : '…'}
      </span>
    </div>
  )
}

export default function QualityCheckScreen() {
  const navigate = useNavigate()
  // The GO1 video checks need the <video> element as a reactive dependency, so
  // we keep it in state (a ref mutation wouldn't re-run them). A parallel ref to
  // the same node lets the effect attach the stream by mutating the DOM element.
  const videoRef = useRef(null)
  const [videoEl, setVideoEl] = useState(null)
  const setVideoNode = useCallback((node) => {
    videoRef.current = node
    setVideoEl(node)
  }, [])
  const platform = useMemo(() => detectPlatform(), [])
  const { stream, audioTrack, permissionStatus, errorKind, requestStream, retry } = useMediaStream()

  const { allPassed, checks } = useQualityGate({ audioTrack, videoElement: videoEl })

  // Attach the stream to the video element once both exist.
  useEffect(() => {
    if (!videoEl || !stream) return
    videoRef.current.srcObject = stream
    videoRef.current.play().catch(() => {})
  }, [videoEl, stream])

  // Acquisition failed (denied / device in use / unplugged) → recovery steps.
  if (permissionStatus === 'denied') {
    return <PermissionDenied platform={platform} errorKind={errorKind} onRetry={retry} />
  }

  function handleRecord() {
    if (!allPassed) return
    navigate('/session', { state: { isFirstSession: !localStorage.getItem('rr_onboarding_seen') } })
  }

  // Figma order: Microphone, Ambient Noise, Camera Angle, Lighting.
  const checkRows = [
    { key: 'mic', icon: ICONS.mic, label: 'Microphone Volume', ...checks.mic, tooltip: ONBOARDING_TOOLTIPS.mic },
    { key: 'noise', icon: ICONS.noise, label: 'Ambient Noise', ...checks.noise, tooltip: ONBOARDING_TOOLTIPS.noise },
    { key: 'camera', icon: ICONS.camera, label: 'Camera Angle', ...checks.camera, tooltip: ONBOARDING_TOOLTIPS.camera },
    { key: 'lighting', icon: ICONS.lighting, label: 'Lighting', ...checks.lighting, tooltip: ONBOARDING_TOOLTIPS.lighting },
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-page font-display">
      <header className="bg-header">
        <div className="mx-auto flex w-full max-w-[480px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <ExitButton onClick={() => navigate('/dashboard')} />
            <LogoMark />
            <span className="text-[20px] font-extrabold text-brand">ReadRight</span>
          </div>
          <span className="text-[11px] font-bold tracking-[0.12em] text-ink-muted">SESSION CHECK</span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-4 px-4 pt-4">
        <p className="text-center text-[15px] leading-[1.5] text-ink-soft">
          Let's make sure everything is ready before you read.
        </p>

        {/* Camera preview + face guide */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-[#111]">
          {permissionStatus === 'pending' ? (
            <div className="flex h-full items-center justify-center">
              <button
                type="button"
                onClick={requestStream}
                className="min-h-[44px] rounded-full bg-brand px-5 text-[15px] font-bold text-white"
              >
                Enable Camera &amp; Mic
              </button>
            </div>
          ) : permissionStatus !== 'granted' ? (
            <div className="flex h-full items-center justify-center">
              <span className="text-[14px] font-semibold text-white/70">Preparing camera…</span>
            </div>
          ) : (
            <>
              <video
                ref={setVideoNode}
                autoPlay
                muted
                playsInline
                className="h-full w-full -scale-x-100 object-cover"
              />
              {/* Head + shoulders dashed guide */}
              <div className="pointer-events-none absolute left-1/2 top-[42%] aspect-[3/4] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-[2.5px] border-dashed border-white/55" />
            </>
          )}
          <p className="absolute inset-x-0 bottom-2 text-center text-[12px] text-white/70">
            Center your face in the guide
          </p>
        </div>

        {/* GO1 check list (vertical) */}
        <div className="flex flex-col gap-3">
          {checkRows.map((c) => (
            <CheckCard key={c.key} {...c} />
          ))}
        </div>

        {/* Guidance — hidden (keeps height) once everything passes */}
        <div
          className={`flex gap-3 rounded-[12px] border-l-4 border-amber bg-amber/10 px-4 py-3 ${
            allPassed ? 'invisible' : 'visible'
          }`}
        >
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber text-[12px] font-bold text-white" aria-hidden="true">
            i
          </span>
          <p className="text-[13px] leading-[1.5] text-ink">
            Point your camera straight at your face and hold the phone at eye level. Make sure
            there's enough light in the room!
          </p>
        </div>

        <p className="text-center text-[12px] text-ink-muted">
          All checks must pass before you can record.
        </p>
      </div>

      <div className="mx-auto w-full max-w-[480px] px-4 pb-8 pt-3">
        <button
          type="button"
          onClick={handleRecord}
          disabled={!allPassed}
          aria-disabled={!allPassed}
          className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full py-4 text-[17px] font-extrabold text-white ${
            allPassed ? 'bg-brand shadow-[0px_4px_0px_#871f1a]' : 'cursor-not-allowed bg-[#d9c5b8]'
          }`}
        >
          <span className="flex size-4 items-center justify-center rounded-full border-2 border-white" aria-hidden="true">
            <span className="size-1.5 rounded-full bg-white" />
          </span>
          Start Recording
        </button>
      </div>
    </div>
  )
}
