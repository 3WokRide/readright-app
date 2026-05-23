/**
 * SessionResultsPage  —  /results route
 *
 * Linear  : REA-25 · RR-040 Session Results Page (critical-path)
 * URL     : https://linear.app/readright/issue/REA-25/rr-040-session-results-page
 * Project : GO4 — Results & Dashboard  |  Labels: critical-path, module:go4
 * Priority: High  |  Estimate: 3 pts  |  Effort: M (4–5 hrs)
 * Created : 2026-05-17 by Reev Santillan
 *
 * Renders the complete Phil-IRI assessment output after the recording flow
 * completes. Matches Figma design "Your Results (English)".
 *
 * Data source: React Router location.state — SessionScreen navigates with
 * { state: { result, passage } } (see ARCHITECTURE.md). Falls back to calling
 * the submitRecording() stub for direct-navigation dev testing.
 *
 * On mount it also persists the session to Supabase with retry (RR-041, REA-26)
 * via saveSessionRecord(). The save never blocks rendering: if all retries fail,
 * results still show and a non-blocking save-failure banner appears (NFR-R1).
 *
 * Sections (in order):
 *   1. Reading Level badge card        → components/results/ReadingLevelCard
 *   2. WPM + Word Recognition stats     → components/results/StatCard ×2
 *   3. Miscue Breakdown                 → components/results/MiscueBreakdown
 *   4. Reading Habits                   → components/results/ReadingHabits
 *   5. Navigation buttons → /dashboard and /session
 *
 * Blocks  : REA-32 · RR-048 (First-Time User Onboarding)
 * Blocked by: REA-8 · RR-004 (FastAPI stub) — api.js stub satisfies this now
 *
 * SRS NFR-U3: Behavioral section uses habit-improvement framing (see ReadingHabits).
 * SRS NFR-P2: Must render within 3 seconds of receiving data.
 */
import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { submitRecording } from '../lib/api'
import { saveSessionRecord } from '../lib/supabase'
import { wrRange } from '../lib/philIri'
import PageShell from '../components/layout/PageShell'
import Button from '../components/ui/Button'
import ReadingLevelCard from '../components/results/ReadingLevelCard'
import StatCard from '../components/results/StatCard'
import MiscueBreakdown from '../components/results/MiscueBreakdown'
import ReadingHabits from '../components/results/ReadingHabits'
import ResultsSkeleton from '../components/results/ResultsSkeleton'

const DEV_PASSAGE_ID = 'phil-iri-g4-p1'

export default function SessionResultsPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const sessionResult = state?.result ?? state ?? null
  const [result, setResult] = useState(sessionResult)
  const [passageId, setPassageId] = useState(state?.passage?.id ?? null)
  const [loading, setLoading] = useState(!sessionResult)
  const [saveSuccess, setSaveSuccess] = useState(true)
  const savedRef = useRef(false)

  // Direct-navigation / dev fallback: no result in route state → call the stub.
  useEffect(() => {
    if (sessionResult) return
    submitRecording(null, DEV_PASSAGE_ID).then((r) => {
      setResult(r)
      setPassageId(DEV_PASSAGE_ID)
      setLoading(false)
    })
  }, [sessionResult])

  // Persist the session once results are available (RR-041). savedRef ensures we
  // INSERT exactly one row despite StrictMode's double-effect and any re-renders.
  useEffect(() => {
    if (!result || !passageId || savedRef.current) return
    savedRef.current = true
    saveSessionRecord(result, passageId).then(({ success }) => setSaveSuccess(success))
  }, [result, passageId])

  return (
    <PageShell>

      {!loading && result && state?.isFirstSession && (
        <div style={{ background: '#FEF9F0', border: '1px solid #F0DFC0', borderRadius: 12, padding: '14px 16px', marginBottom: 8, fontFamily: 'system-ui, sans-serif' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#1A1008', margin: '0 0 4px' }}>Here are your results! 🎉</p>
          <p style={{ fontSize: 13, color: '#8B7355', margin: 0, lineHeight: 1.55 }}>These show how you read today. Check your progress dashboard to see how you improve over time.</p>
        </div>
      )}

      {loading && <ResultsSkeleton />}

      {!loading && result && (
        <>
          {!saveSuccess && <SaveFailureBanner />}

          <ReadingLevelCard readingLevel={result.reading_level} />

          <div className="flex gap-4">
            <StatCard
              value={Math.round(result.wpm)}
              label="WORDS PER MINUTE"
              sub="Grade 4 target: 80 WPM"
              valueColor="var(--color-brand)"
            />
            <StatCard
              value={`${Math.round(result.word_recognition_pct)}%`}
              label="WORD RECOGNITION"
              sub={wrRange(result.word_recognition_pct).label}
              valueColor="var(--color-goal)"
              subColor={wrRange(result.word_recognition_pct).color}
            />
          </div>

          <MiscueBreakdown result={result} />
          <ReadingHabits result={result} />

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate('/dashboard')}>See My Progress</Button>
            <Button variant="secondary" onClick={() => navigate('/session')}>
              Try Another Passage
            </Button>
          </div>
        </>
      )}
    </PageShell>
  )
}

/**
 * Non-blocking banner shown when the session could not be saved after retries.
 * Never hides results (NFR-R1). Uses an icon + amber colour (not colour alone)
 * and gives a concrete recovery action, per the UI/UX error-message rules.
 */
function SaveFailureBanner() {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-[12px] border border-amber bg-amber/10 px-4 py-3"
    >
      <span
        className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-amber text-[12px] font-bold text-white"
        aria-hidden="true"
      >
        !
      </span>
      <p className="text-[14px] leading-[20px] text-ink">
        We could not save these results to your progress. Your scores below are still
        correct. Please check your internet connection and try another reading later.
      </p>
    </div>
  )
}
