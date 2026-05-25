/**
 * DashboardPage  —  /dashboard route
 *
 * Linear  : REA-27 · RR-042 Progress Dashboard (In Progress)
 * URL     : https://linear.app/readright/issue/REA-27/rr-042-progress-dashboard
 * Project : GO4 — Results & Dashboard  |  Labels: module:go4, Feature
 * Assignee: Christian  |  Priority: High  |  Estimate: 3 pts  |  Effort: M (4–5 hrs)
 * Created : 2026-05-17 by Reev Santillan  |  Started: 2026-05-21
 *
 * Personal progress dashboard for Grade 4 Phil-IRI learners, matching the
 * Figma design "My Profile (English)" (node 5:458).
 * Figma: https://www.figma.com/design/WT6Ylrxrcv9YBEsdS3Riy1/Readright?node-id=5-458
 *
 * ── Sections (top → bottom) ──────────────────────────────────────────────
 *
 *  1. Header bar               → components/layout/AppHeader (via PageShell)
 *  2. Profile Header Card      → components/dashboard/ProfileHeaderCard
 *  3. Achievements             → components/dashboard/AchievementsSection (decorative)
 *  4. Stats Summary Card       → components/dashboard/StatsSummaryCard
 *  5. Reading Level Trend      → components/dashboard/ReadingLevelChart
 *  6. WPM Progression          → components/dashboard/WpmChart
 *  7. Miscue Breakdown         → components/dashboard/MiscueBreakdownChart (REA-33)
 *  8. Reading Habits           → components/dashboard/BehavioralHistoryTable (REA-33)
 *
 * ── States ───────────────────────────────────────────────────────────────
 *
 *  Loading  DashboardSkeleton while useSessionHistory fetches.
 *  Empty    EmptyState when sessions.length === 0 after load.
 *  Error    ErrorState (with Retry) when Supabase returns an error.
 *
 * ── Data ─────────────────────────────────────────────────────────────────
 *
 *  Source : useSessionHistory() → Supabase `sessions` table (all columns).
 *  Seed   : See zplan.md §"Seed Data" — test account test.learner@readright.dev.
 *  Domain : reading-level mapping lives in lib/philIri.js.
 *
 * ── Dependencies ──────────────────────────────────────────────────────────
 *
 *  Blocked by : REA-6  · RR-002 (Deploy Sessions Table Schema with RLS)
 *  REA-33     · RR-049 (Miscue Patterns + Behavioral History) — added here as
 *               sections 7 & 8, aggregating the same useSessionHistory data.
 *
 * ── Definition of Done (REA-27) ───────────────────────────────────────────
 *
 *  ✦ Dashboard loads with seeded test session records
 *  ✦ Reading Level chart renders data points in chronological order
 *  ✦ WPM chart shows Grade 4 benchmark reference line at y=90
 *  ✦ Empty + error states handled
 *  ✦ Page loads within 5 s on simulated 4G (SRS NFR-P3)
 *  ✦ Visual matches Figma "My Profile (English)"
 */
import { useNavigate } from 'react-router-dom'
import { useSessionHistory } from '../hooks/useSessionHistory'
import { levelToNum } from '../lib/philIri'
import PageShell from '../components/layout/PageShell'
import ProfileHeaderCard from '../components/dashboard/ProfileHeaderCard'
import AchievementsSection from '../components/dashboard/AchievementsSection'
import StatsSummaryCard from '../components/dashboard/StatsSummaryCard'
import ReadingLevelChart from '../components/dashboard/ReadingLevelChart'
import WpmChart from '../components/dashboard/WpmChart'
import MiscueBreakdownChart from '../components/dashboard/MiscueBreakdownChart'
import BehavioralHistoryTable from '../components/dashboard/BehavioralHistoryTable'
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton'
import EmptyState from '../components/dashboard/EmptyState'
import ErrorState from '../components/dashboard/ErrorState'

export default function DashboardPage() {
  const { sessions, loading, error } = useSessionHistory()
  const navigate = useNavigate()
  // Entry point into a new reading: routes through the GO1 gate (/quality-check),
  // which auto-acquires the camera when already permitted and then flows to
  // /session. Keeps the dashboard a hub instead of a dead end.
  const startReading = () => navigate('/quality-check')

  const levelData = sessions.map((s, i) => ({
    label: `S${i + 1}`,
    level: levelToNum[s.reading_level] ?? 1,
  }))

  const wpmData = sessions.map((s) => ({
    date: new Date(s.session_timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    wpm: Math.round(s.wpm),
  }))

  const avgScore = sessions.length
    ? Math.round(sessions.reduce((sum, s) => sum + s.word_recognition_pct, 0) / sessions.length)
    : 0

  const improvement = sessions.length > 1
    ? Math.round(((sessions.at(-1).wpm - sessions[0].wpm) / sessions[0].wpm) * 100)
    : null

  const latestLevel = sessions.at(-1)?.reading_level ?? '—'
  const latestWpm = sessions.length ? Math.round(sessions.at(-1).wpm) : null

  return (
    <PageShell>
      {error && <ErrorState />}

      {!error && loading && <DashboardSkeleton />}

      {!error && !loading && sessions.length === 0 && <EmptyState onStart={startReading} />}

      {!error && !loading && sessions.length > 0 && (
        <>
          <ProfileHeaderCard latestLevel={latestLevel} />
          <AchievementsSection />
          <StatsSummaryCard count={sessions.length} avgScore={avgScore} />
          <ReadingLevelChart data={levelData} />
          <WpmChart data={wpmData} latestWpm={latestWpm} improvement={improvement} />
          <MiscueBreakdownChart sessions={sessions} />
          <BehavioralHistoryTable sessions={sessions} />

          {/* Fixed primary action so a new reading is always one tap away,
              without scrolling past every chart. PageShell's pb-24 clears it. */}
          <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[480px] bg-gradient-to-t from-page via-page to-transparent px-5 pb-5 pt-8">
            <button
              type="button"
              onClick={startReading}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-[17px] font-extrabold text-white shadow-[0px_4px_0px_#871f1a]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start New Reading
            </button>
          </div>
        </>
      )}
    </PageShell>
  )
}
