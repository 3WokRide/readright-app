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
 * Data source: React Router location.state (AssessmentResultJSON passed by
 * SessionScreen via navigate('/results', { state: result })). Falls back to
 * calling submitRecording() stub for direct-navigation dev testing.
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
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { submitRecording } from '../lib/api'
import { wrRange } from '../lib/philIri'
import PageShell from '../components/layout/PageShell'
import Button from '../components/ui/Button'
import ReadingLevelCard from '../components/results/ReadingLevelCard'
import StatCard from '../components/results/StatCard'
import MiscueBreakdown from '../components/results/MiscueBreakdown'
import ReadingHabits from '../components/results/ReadingHabits'
import ResultsSkeleton from '../components/results/ResultsSkeleton'

export default function SessionResultsPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const sessionResult = state?.result ?? state ?? null
  const [result, setResult] = useState(sessionResult)
  const [loading, setLoading] = useState(!state)

  useEffect(() => {
    if (!state) {
      submitRecording(null, 'phil-iri-g4-p1').then((r) => {
        setResult(r)
        setLoading(false)
      })
    }
  }, [state])

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
