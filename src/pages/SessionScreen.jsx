// SessionScreen.jsx — GO1 entry: permission gate → live preview → recording.
//
// Stream ownership (see ARCHITECTURE.md):
//   useMediaStream  — acquires & owns the combined audio+video stream (the only
//                     getUserMedia caller, the only track.stop() caller).
//   useMediaRecorder — records that stream into an MP4/WebM File. It never calls
//                     getUserMedia and never stops tracks, so the preview keeps
//                     running after a recording stops.
//
// This page renders one of three states based on permissionStatus:
//   pending/requesting → PermissionExplainer (in-app explanation before the
//                        native browser prompt)
//   denied             → PermissionDenied (device-specific recovery steps)
//   granted            → passage + live CameraPreview + record/stop, then the
//                        processing screen while results are computed.
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getRandomPassage } from '../data/passages'
import { submitRecording } from '../lib/api'
import { useMediaStream } from '../hooks/useMediaStream'
import { useMediaRecorder } from '../hooks/useMediaRecorder'
import { detectPlatform } from '../utils/platform'
import { CameraPreview } from '../components/quality/CameraPreview'
import { PermissionExplainer } from '../components/quality/PermissionExplainer'
import { PermissionDenied } from '../components/quality/PermissionDenied'

const MAX_RECORDING_MS = 5 * 60 * 1000
const STEPS = ['Uploading', 'Transcribing', 'Scoring', 'Done']

// Static height + stagger per bar. Full literal class strings so Tailwind's
// JIT scanner generates them (avoids inline style={{}}).
const WAVE_BARS = [
  'h-[8px] [animation-delay:0ms]',
  'h-[15px] [animation-delay:90ms]',
  'h-[22px] [animation-delay:180ms]',
  'h-[13px] [animation-delay:270ms]',
  'h-[20px] [animation-delay:360ms]',
  'h-[11px] [animation-delay:450ms]',
  'h-[18px] [animation-delay:540ms]',
  'h-[9px] [animation-delay:630ms]',
  'h-[16px] [animation-delay:720ms]',
]

function formatElapsed(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function SessionScreen() {
  const passage = useMemo(() => getRandomPassage(), [])
  const platform = useMemo(() => detectPlatform(), [])
  const navigate = useNavigate()
  const { state: routeState } = useLocation()
  const isFirstSession = routeState?.isFirstSession ?? false

  const { stream, permissionStatus, errorKind, requestStream, retry } = useMediaStream()
  const { recordingState, elapsed, start, stop } = useMediaRecorder(stream, {
    maxDurationMs: MAX_RECORDING_MS,
  })

  const [phase, setPhase] = useState('ready') // 'ready' | 'processing'
  const [processingStep, setProcessingStep] = useState(0)

  const mountedRef = useRef(true)
  const processingTimerRef = useRef(null)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      clearInterval(processingTimerRef.current)
    }
  }, [])

  async function handleStop() {
    setPhase('processing')
    setProcessingStep(0)

    // Advance the step indicator while we wait for the result.
    let step = 0
    processingTimerRef.current = setInterval(() => {
      step += 1
      if (step < STEPS.length - 1) setProcessingStep(step)
    }, 800)

    const file = await stop()
    if (!mountedRef.current) return
    if (!file) {
      clearInterval(processingTimerRef.current)
      setPhase('ready')
      return
    }

    try {
      // submitRecording (lib/api.js) is the FastAPI client. Robust timeout /
      // retry / error UX is owned by the future useAnalyzeSubmit hook.
      const result = await submitRecording(file, passage.id)
      if (!mountedRef.current) return
      clearInterval(processingTimerRef.current)
      setProcessingStep(STEPS.length - 1)
      setTimeout(() => {
        if (mountedRef.current) navigate('/results', { state: { result, passage, isFirstSession } })
      }, 400)
    } catch (err) {
      console.error(err)
      if (!mountedRef.current) return
      clearInterval(processingTimerRef.current)
      setPhase('ready')
    }
  }

  // --- Permission gate -------------------------------------------------------
  if (permissionStatus === 'pending' || permissionStatus === 'requesting') {
    return (
      <PermissionExplainer
        onAllow={requestStream}
        requesting={permissionStatus === 'requesting'}
      />
    )
  }

  if (permissionStatus === 'denied') {
    return <PermissionDenied platform={platform} errorKind={errorKind} onRetry={retry} />
  }

  // --- Processing screen -----------------------------------------------------
  if (phase === 'processing') {
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-page font-display">
        <Header />
        <div className="flex flex-1 flex-col items-center px-5 pb-6 pt-8">
          <div className="mb-7 flex size-32 items-center justify-center rounded-full bg-card text-brand">
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
className="animate-pulse" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <h2 className="text-center text-[22px] font-extrabold text-ink">
            Analyzing your reading…
          </h2>
          <p className="mt-2 text-center text-[16px] leading-[24px] text-ink-soft">
            This usually takes 1–2 minutes. Please don't close the app.
          </p>

          {/* Step progress — done steps use a checkmark (icon + colour) */}
          <ol className="mt-8 flex w-full items-start justify-between">
            {STEPS.map((label, i) => {
              const done = i < processingStep
              const active = i === processingStep
              return (
                <li key={label} className="flex flex-1 flex-col items-center gap-2">
                  <span
                    className={`flex size-8 items-center justify-center rounded-full text-[12px] font-bold ${
                      done
                        ? 'bg-goal text-white'
                        : active
                          ? 'bg-brand text-white'
                          : 'bg-card-border text-white'
                    }`}
                  >
                    {done ? '✓' : i + 1}
                  </span>
                  <span
                    className={`text-center text-[12px] ${
                      active ? 'font-bold text-brand' : done ? 'font-semibold text-goal' : 'text-ink-muted'
                    }`}
                  >
                    {label}
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="mt-auto flex w-full items-start gap-3 rounded-[12px] bg-amber/10 px-4 py-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber text-[12px] font-bold text-white" aria-hidden="true">
              i
            </span>
            <p className="text-[14px] leading-[20px] text-ink">
              Do not close this screen while your reading is being checked.
            </p>
          </div>

          <p className="mt-6 text-center text-[12px] text-ink-muted">
            Powered by Phil-IRI Assessment Engine
          </p>
        </div>
      </div>
    )
  }

  // --- Granted: passage + live preview + record/stop -------------------------
  const isRecording = recordingState === 'recording'

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-page font-display">
      <Header label="READING SESSION" />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-2 pt-5">
        <CameraPreview stream={stream} />

        <div className="rounded-[16px] border border-card-border bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[20px] font-extrabold text-ink">{passage.title}</h2>
            <span className="rounded-full bg-goal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-goal">
              Easy
            </span>
          </div>
          <p className="text-[18px] leading-[1.85] text-ink">{passage.text}</p>
        </div>

        <p className="px-4 text-center text-[14px] text-ink-muted">
          Read this passage aloud, clearly and at your normal pace.
        </p>

        {isRecording && (
          <div className="flex items-center gap-3 rounded-[12px] border border-brand/20 bg-brand/5 px-4 py-3">
            <span className="size-2.5 shrink-0 animate-pulse rounded-full bg-brand" aria-hidden="true" />
            <span className="text-[14px] font-semibold text-brand">Recording…</span>
            <div className="flex flex-1 items-center justify-center gap-[3px]" aria-hidden="true">
              {WAVE_BARS.map((bar, i) => (
                <span key={i} className={`w-[3px] rounded-full bg-brand/70 animate-pulse ${bar}`} />
              ))}
            </div>
            <span className="shrink-0 text-[15px] font-semibold tabular-nums text-ink">
              {formatElapsed(elapsed)}
            </span>
          </div>
        )}
      </div>

      <div className="px-4 pb-8 pt-3">
        {isRecording ? (
          <button
            type="button"
            onClick={handleStop}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border-[2.5px] border-brand bg-white py-4 text-[17px] font-bold 
text-brand"
          >
            <span className="size-3.5 rounded-[3px] bg-brand" aria-hidden="true" />
            Stop Recording
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-[17px] font-bold text-white 
shadow-[0px_4px_0px_#871f1a]"
          >
            <span className="size-3 rounded-full bg-white" aria-hidden="true" />
            Start Recording
          </button>
        )}
      </div>
    </div>
  )
}

function Header({ label }) {
  return (
    <header className="flex items-center justify-between border-b border-card-border bg-header px-5 py-4">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-[8px] bg-brand text-[16px] font-extrabold text-white">
          R
        </span>
        <span className="text-[18px] font-extrabold text-ink">ReadRight</span>
      </div>
      {label && (
        <span className="text-[11px] font-semibold tracking-[0.1em] text-ink-muted">{label}</span>
      )}
    </header>
  )
}