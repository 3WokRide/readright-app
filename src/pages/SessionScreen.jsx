// SessionScreen.jsx — GO1 entry: permission gate → live preview → recording.
//
// Stream ownership (see ARCHITECTURE.md):
//   useMediaStream  — acquires & owns the combined audio+video stream (the only
//                     getUserMedia caller, the only track.stop() caller).
//   useMediaRecorder — records that stream into an MP4/WebM File. It never calls
//                     getUserMedia and never stops tracks, so the preview keeps
//                     running after a recording stops.
//
// This page renders one of these states based on permissionStatus:
//   checking           → neutral "Preparing camera…" placeholder while the hook
//                        probes existing permission (and silently acquires the
//                        stream if camera+mic were already granted)
//   pending/requesting → PermissionExplainer (in-app explanation before the
//                        native browser prompt)
//   denied             → PermissionDenied (device-specific recovery steps)
//   granted            → passage + live CameraPreview + record/stop, then the
//                        processing screen while results are computed.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { usePassage } from '../hooks/usePassage'
import { useMediaStream } from '../hooks/useMediaStream'
import { useMediaRecorder } from '../hooks/useMediaRecorder'
import { useAnalyzeSubmit } from '../hooks/useAnalyzeSubmit'
import { useRecordingMonitor } from '../hooks/useRecordingMonitor'
import { detectPlatform } from '../utils/platform'
import { CameraPreview } from '../components/quality/CameraPreview'
import { RecordingChecks } from '../components/session/RecordingChecks'
import { PermissionExplainer } from '../components/quality/PermissionExplainer'
import { PermissionDenied } from '../components/quality/PermissionDenied'
import ExitButton from '../components/ui/ExitButton'
import { LogoMark } from '../components/icons'

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
  // Passages come from Supabase (single source of truth) — fetched + randomly
  // picked by usePassage. May still be loading when the camera is granted; the
  // preview/GO1 checks must never be blocked on it (CLAUDE.md), only the
  // passage card and the Start button wait for content.
  const { passage, error: passageError, retry: retryPassage } = usePassage()
  const platform = useMemo(() => detectPlatform(), [])
  const navigate = useNavigate()
  const { state: routeState } = useLocation()
  const isFirstSession = routeState?.isFirstSession ?? false

  const { stream, audioTrack, permissionStatus, errorKind, requestStream, retry } = useMediaStream()
  const { recordingState, elapsed, start, stop } = useMediaRecorder(stream, {
    maxDurationMs: MAX_RECORDING_MS,
  })
  // useAnalyzeSubmit owns the FastAPI POST: AbortController, 120s timeout, and
  // the idle/submitting/success/error/timeout state machine (see ARCHITECTURE.md).
  const { status, result, submit, reset } = useAnalyzeSubmit()

  const isRecording = recordingState === 'recording'

  // The live <video> from CameraPreview, kept in state so the monitor's check
  // hooks re-run when it mounts. Memoize the callback ref or it thrashes the node
  // and re-inits MediaPipe every render.
  const [videoEl, setVideoEl] = useState(null)
  const setVideoNode = useCallback((node) => setVideoEl(node), [])

  // Real-time GO1 monitoring — runs only while recording (active gates the checks).
  const monitor = useRecordingMonitor({ audioTrack, videoElement: videoEl, active: isRecording })
  // Reason captured from the monitor so it survives the recording stopping (which
  // clears monitor.failure). stopReasonRef makes a quality stop claim the take once.
  const [qualityFailure, setQualityFailure] = useState(null)
  const stopReasonRef = useRef(false)

  const [processingStep, setProcessingStep] = useState(0)

  // Keep the processing screen up while the analysis is in flight AND until we
  // navigate away on success — avoids a flash of the record screen in between.
  const isProcessing = status === 'submitting' || status === 'success'

  // Cosmetic step indicator, scoped to the in-flight submit. setState happens
  // only inside the timer callback (async — never synchronously in the effect
  // body); the step is reset in handleStop before submit starts. The effect
  // cleanup clears the timer when the status leaves 'submitting'.
  useEffect(() => {
    if (status !== 'submitting') return
    let step = 0
    const stepTimer = setInterval(() => {
      step += 1
      if (step < STEPS.length - 1) setProcessingStep(step)
    }, 800)
    return () => clearInterval(stepTimer)
  }, [status])

  // On success, hold the processing screen briefly (the "Done" step is shown via
  // displayStep below), then navigate to results.
  useEffect(() => {
    if (status !== 'success' || !result) return
    const t = setTimeout(
      () => navigate('/results', { state: { result, passage, isFirstSession } }),
      400,
    )
    return () => clearTimeout(t)
  }, [status, result, navigate, passage, isFirstSession])

  // Real-time quality failure: capture the reason BEFORE stopping (stopping flips
  // isRecording false, which makes the monitor clear its own failure), then stop
  // and DISCARD the take — never submit a recording we already know is unusable.
  useEffect(() => {
    if (!monitor.failure || !isRecording || stopReasonRef.current) return
    stopReasonRef.current = true
    setQualityFailure(monitor.failure)
    stop().catch(() => {})
  }, [monitor.failure, isRecording, stop])

  async function handleStop() {
    if (stopReasonRef.current) return // a quality failure already claimed this take
    stopReasonRef.current = true
    const file = await stop()
    if (!file) return
    setProcessingStep(0)
    submit(file, passage.id)
  }

  // Bail out of the session back to the dashboard. If a take is in progress,
  // claim it (so the stop/monitor effects don't submit) and stop the recorder to
  // discard it; unmounting then lets useMediaStream release the camera/mic.
  function handleCancel() {
    stopReasonRef.current = true
    if (isRecording) stop().catch(() => {})
    navigate('/dashboard')
  }

  function handleStart() {
    if (!passage) return // nothing to read yet — the button is disabled too
    reset() // clear any prior error/timeout before a fresh take
    setQualityFailure(null)
    monitor.clearFailure() // drop the monitor's stale failure so it can't re-fire
    stopReasonRef.current = false
    start()
  }

  // Specific, recovery-oriented copy per failure kind (CLAUDE.md error rules) —
  // never a generic "something went wrong".
  const errorMessage =
    status === 'timeout'
      ? 'This is taking longer than usual. Please check your internet, then tap Start Recording to try again.'
      : status === 'error'
        ? "We couldn't check your reading this time. Please tap Start Recording to try again."
        : null

  // --- Permission gate -------------------------------------------------------
  // While probing existing permission (and silently acquiring when pre-granted),
  // show a quiet placeholder — never the explainer — so the pre-granted path
  // reads as an instant jump to the recording view.
  if (permissionStatus === 'checking') {
    return <Preparing />
  }

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
  if (isProcessing) {
    // On success, show every step done (the brief "Done" flash before navigation).
    const displayStep = status === 'success' ? STEPS.length - 1 : processingStep
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-page font-display">
        <Header />
        <div className="flex flex-1 flex-col px-5 pb-6 pt-5">
          {/* Top reassurance banner */}
          <div className="flex items-start gap-3 rounded-[12px] bg-brand/5 px-4 py-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-soft text-[12px] font-bold text-white" aria-hidden="true">
              i
            </span>
            <p className="text-[14px] leading-[20px] text-ink-soft">
              Still working — this can take up to 2 minutes. Please don't close the app.
            </p>
          </div>

          {/* Center: heading + step progress */}
          <div className="flex flex-1 flex-col justify-center py-8">
            <h2 className="text-center text-[24px] font-extrabold text-ink">
              Analyzing your reading…
            </h2>
            <p className="mt-2 text-center text-[16px] leading-[24px] text-ink-soft">
              This usually takes less than a minute. Please wait.
            </p>

            {/* Stepper — circles joined by connectors; state by icon + colour */}
            <ol className="mt-8 flex w-full items-start" aria-live="polite">
              {STEPS.map((label, i) => {
                const done = i < displayStep
                const active = i === displayStep
                const last = i === STEPS.length - 1
                return (
                  <li key={label} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex w-full items-center">
                      <span className={`h-[3px] flex-1 rounded-full ${i === 0 ? 'opacity-0' : done || active ? 'bg-goal' : 'bg-card-border'}`} />
                      {done ? (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-goal text-[14px] font-bold text-white">
                          ✓
                        </span>
                      ) : active ? (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-[3px] border-brand bg-white">
                          <span className="size-2.5 rounded-full bg-brand" />
                        </span>
                      ) : (
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-card-border">
                          <span className="size-2 rounded-full bg-white/70" />
                        </span>
                      )}
                      <span className={`h-[3px] flex-1 rounded-full ${last ? 'opacity-0' : done ? 'bg-goal' : 'bg-card-border'}`} />
                    </div>
                    <span
                      className={`text-center text-[11px] font-bold uppercase tracking-[0.04em] ${
                        active ? 'text-brand' : done ? 'text-goal' : 'text-ink-muted'
                      }`}
                    >
                      {label}{last ? '!' : ''}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Bottom warning banner + footer */}
          <div className="flex items-start gap-3 rounded-[12px] bg-brand/5 px-4 py-3">
            <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white" aria-hidden="true">
              i
            </span>
            <p className="text-[14px] leading-[20px] text-ink">
              Do not close this screen while your reading is being analyzed.
            </p>
          </div>

          <p className="mt-4 text-center text-[12px] text-ink-muted">
            Powered by Phil-IRI Assessment Engine
          </p>
        </div>
      </div>
    )
  }

  // --- Granted: passage + live preview + record/stop -------------------------
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-page font-display">
      <Header label="READING SESSION" onCancel={handleCancel} />

      <div className="flex flex-1 flex-col gap-4 px-4 pb-2 pt-5">
        {/* Visible self-view so the learner can keep their face framed and adjust
            while reading. Also feeds the live GO1 monitor (useRecordingMonitor). */}
        <CameraPreview stream={stream} onVideoNode={setVideoNode} />

        <div className="rounded-[16px] border border-card-border bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[20px] font-extrabold text-ink">Read This Out Loud</h2>
            <span className="rounded-full bg-goal/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-goal">
              Easy
            </span>
          </div>
          {passageError ? (
            <div role="alert" className="flex flex-col gap-3">
              <p className="text-[16px] leading-[24px] text-ink">
                We couldn't load your reading passage. Please check your internet, then tap Try Again.
              </p>
              <button
                type="button"
                onClick={retryPassage}
                className="min-h-[44px] self-start rounded-full bg-brand px-6 py-2 text-[15px] font-bold text-white"
              >
                Try Again
              </button>
            </div>
          ) : passage ? (
            <p className="text-[18px] leading-[1.85] text-ink">{passage.text}</p>
          ) : (
            <p className="text-[16px] leading-[24px] text-ink-muted" aria-live="polite">
              Getting your passage ready…
            </p>
          )}
        </div>

        <p className="px-4 text-center text-[14px] text-ink-muted">
          Read this passage aloud, clearly and at your normal pace.
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-[12px] border border-brand/30 bg-brand/5 px-4 py-3"
          >
            <span
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white"
              aria-hidden="true"
            >
              !
            </span>
            <p className="text-[14px] leading-[20px] text-ink">{errorMessage}</p>
          </div>
        )}

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

        {/* Live GO1 checks — only while recording (see useRecordingMonitor). */}
        {isRecording && <RecordingChecks checks={monitor.checks} />}

        {/* A real-time check failed → recording was stopped and discarded. */}
        {!isRecording && qualityFailure && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-[12px] border border-brand/30 bg-brand/5 px-4 py-3"
          >
            <span
              className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white"
              aria-hidden="true"
            >
              !
            </span>
            <p className="text-[14px] leading-[20px] text-ink">
              {qualityFailure.message} Let's try that again.
            </p>
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
            onClick={handleStart}
            disabled={!passage}
            className={`flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full py-4 text-[17px] font-bold text-white ${
              passage
                ? 'bg-brand shadow-[0px_4px_0px_#871f1a]'
                : 'cursor-not-allowed bg-card-border'
            }`}
          >
            <span className="size-3 rounded-full bg-white" aria-hidden="true" />
            {qualityFailure ? 'Record Again' : 'Start Recording'}
          </button>
        )}
      </div>
    </div>
  )
}

// Quiet placeholder shown while useMediaStream probes/silently acquires an
// already-granted stream. Intentionally minimal so the pre-granted path feels
// like a direct transition rather than a loading screen.
function Preparing() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col bg-page font-display">
      <Header label="READING SESSION" />
      <div className="flex flex-1 flex-col items-center justify-center px-5 pb-10">
        <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-card text-brand">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" aria-hidden="true">
            <path d="m23 7-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        </div>
        <p className="text-center text-[16px] font-semibold text-ink-soft" aria-live="polite">
          Preparing camera…
        </p>
      </div>
    </div>
  )
}

function Header({ label, onCancel }) {
  return (
    <header className="bg-header">
      <div className="mx-auto flex w-full max-w-[480px] items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {onCancel && <ExitButton onClick={onCancel} className="-ml-2" />}
          <LogoMark />
          <span className="text-[20px] font-extrabold text-brand">ReadRight</span>
        </div>
        {label && (
          <span className="text-[11px] font-bold tracking-[0.12em] text-ink-muted">{label}</span>
        )}
      </div>
    </header>
  )
}