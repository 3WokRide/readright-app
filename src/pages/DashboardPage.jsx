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
 *  1. Header bar
 *     ReadRight logo (left) + learner avatar initial circle (right).
 *
 *  2. Profile Header Card
 *     96 px avatar with "LVL 4" badge, display name from Supabase auth,
 *     and the learner's most recent reading_level label.
 *
 *  3. Achievements  (decorative — no data model yet)
 *     Three static badge cards: Early Bird, 5-Day Streak, Perfect Recog.
 *     Icons are inline SVG. Real achievement logic is out of scope for REA-27.
 *
 *  4. Stats Summary Card
 *     Total assessment count and average word_recognition_pct across all sessions.
 *
 *  5. Reading Level Trend Chart  (Recharts LineChart, type="stepAfter")
 *     X-axis: session index (S1, S2, …)
 *     Y-axis: 1=Frustration / 2=Instructional / 3=Independent (custom tick labels)
 *     Green dashed ReferenceLine at y=3 labelled "GOAL".
 *
 *  6. WPM Progression Chart  (Recharts LineChart, type="monotone")
 *     X-axis: short date string per session
 *     Red dashed ReferenceLine at y=90 labelled "Grade 4 Target" (SRS §scoring).
 *     "+N% IMPROVEMENT" badge rendered when sessions.length > 1.
 *
 * ── States ───────────────────────────────────────────────────────────────
 *
 *  Loading  Skeleton shimmer cards while useSessionHistory fetches.
 *  Empty    Shown when sessions.length === 0 after load completes.
 *  Error    Shown when Supabase returns an error; includes a Retry button.
 *
 * ── Design Tokens (Figma node 5:458) ─────────────────────────────────────
 *
 *  Brand red      #a5352d    Card bg        #fff0ee    Stats card bg  #f1dcc9
 *  Page bg        rgba(165,53,45,0.05)      Card border  #dfbfbc
 *  Card shadow    drop-shadow-[0px_4px_0px_#e6dcc3]
 *  Goal green     #36663e    Text primary   #241917    Text secondary #58413f
 *  Reading level  #6b5c4d    Font           Nunito Sans (400 / 600 / 700 / 800)
 *
 * ── Data ─────────────────────────────────────────────────────────────────
 *
 *  Source : useSessionHistory() → Supabase `sessions` table (all columns).
 *  Seed   : See zplan.md §"Seed Data" — test account test.learner@readright.dev.
 *
 * ── Dependencies ──────────────────────────────────────────────────────────
 *
 *  Blocked by : REA-6  · RR-002 (Deploy Sessions Table Schema with RLS)
 *               The `sessions` table must exist in Supabase before data loads.
 *
 *  Blocks     : REA-33 · RR-049 (Dashboard Miscue + Behavioral History Charts)
 *               Miscue Patterns and Behavioral History sections are visible in
 *               the Figma design but intentionally NOT implemented here.
 *               REA-33 will add them using the same useSessionHistory hook.
 *
 * ── Definition of Done (REA-27) ───────────────────────────────────────────
 *
 *  ✦ Dashboard loads with seeded test session records
 *  ✦ Reading Level chart renders data points in chronological order;
 *    Y-axis labels Frustration / Instructional / Independent
 *  ✦ WPM chart shows Grade 4 benchmark reference line at y=90
 *  ✦ Empty state shown when no sessions exist
 *  ✦ Error state shown when Supabase query fails
 *  ✦ Page loads within 5 s on simulated 4G (SRS NFR-P3)
 *  ✦ Visual matches Figma "My Profile (English)" — colors, typography, shadows
 */
import { useState, useEffect } from 'react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, ReferenceLine, Tooltip,
} from 'recharts'
import { useSessionHistory } from '../hooks/useSessionHistory'
import { supabase } from '../lib/supabase'

const levelToNum = { Frustration: 1, Instructional: 2, Independent: 3 }

// --- Inline SVG icons for achievement badges ---

function EarlyBirdIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a5352d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="4"/>
      <line x1="12" y1="20" x2="12" y2="22"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="2" y1="12" x2="4" y2="12"/>
      <line x1="20" y1="12" x2="22" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function StreakIcon() {
  return (
    <svg width="22" height="28" viewBox="0 0 24 24" fill="none" stroke="#36663e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  )
}

function PerfectIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a5352d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

// --- Custom Y-axis tick for Reading Level chart ---

function LevelTick({ x, y, payload }) {
  const labels = { 3: 'Independent', 2: 'Instructional', 1: 'Frustration' }
  const colors = { 3: '#36663e', 2: '#58413f', 1: '#a5352d' }
  const weights = { 3: '400', 2: '400', 1: '700' }
  const label = labels[payload.value]
  if (!label) return null
  return (
    <text
      x={x}
      y={y}
      dy={4}
      textAnchor="end"
      fontSize={10}
      fill={colors[payload.value]}
      fontWeight={weights[payload.value]}
      fontFamily="'Nunito Sans', sans-serif"
    >
      {label}
    </text>
  )
}

// --- Custom tooltip for Reading Level chart ---

function LevelTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const labels = { 3: 'Independent', 2: 'Instructional', 1: 'Frustration' }
  return (
    <div className="bg-[#a5352d] text-white text-[9px] rounded-[6px] px-2 py-1 shadow">
      {labels[payload[0].value]}
    </div>
  )
}

// --- Skeleton shimmer for loading state ---

function ChartSkeleton({ height }) {
  return (
    <div
      className="rounded-[12px] w-full animate-pulse bg-[#fff0ee]"
      style={{ height }}
    />
  )
}

export default function DashboardPage() {
  const { sessions, loading, error } = useSessionHistory()
  const [user, setUser] = useState(null)
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
  }, [])

  const displayName = user?.user_metadata?.display_name
    ?? user?.email?.split('@')[0]
    ?? 'Learner'
  const initial = displayName.charAt(0).toUpperCase()

  // Derived chart data
  const levelData = sessions.map((s, i) => ({
    label: `S${i + 1}`,
    level: levelToNum[s.reading_level] ?? 1,
  }))

  const wpmData = sessions.map(s => ({
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

  function handleRetry() {
    setRetrying(true)
    window.location.reload()
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background: 'linear-gradient(90deg, rgba(165,53,45,0.05) 0%, rgba(165,53,45,0.05) 100%), linear-gradient(90deg, #fff 0%, #fff 100%)',
        fontFamily: "'Nunito Sans', sans-serif",
      }}
    >
      {/* Header bar */}
      <header className="bg-[#fff8f7] flex items-center justify-between px-5 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <svg width="30" height="28" viewBox="0 0 30 28" fill="none">
            <rect width="30" height="28" rx="4" fill="#a5352d"/>
            <text x="5" y="20" fontSize="16" fontWeight="800" fill="white" fontFamily="sans-serif">R</text>
          </svg>
          <span
            className="text-[#a5352d] text-[24px] leading-[32px]"
            style={{ fontWeight: 800 }}
          >
            ReadRight
          </span>
        </div>
        <div className="size-[40px] rounded-full bg-[#a5352d] border-2 border-white flex items-center justify-center shadow-sm">
          <span className="text-white text-[18px]" style={{ fontWeight: 700 }}>
            {initial}
          </span>
        </div>
      </header>

      {/* Main scroll area */}
      <main className="bg-[rgba(165,53,45,0.05)] flex flex-col gap-6 pt-6 px-5 pb-24 flex-1">

        {/* Error state */}
        {error && (
          <div className="bg-[#fff0ee] border border-[#dfbfbc] rounded-[12px] p-6 flex flex-col items-center gap-4 text-center">
            <p className="text-[#241917] text-[16px]" style={{ fontWeight: 600 }}>
              Unable to load your progress.
            </p>
            <p className="text-[#58413f] text-[14px]">
              Please check your connection and try again.
            </p>
            <button
              onClick={handleRetry}
              className="bg-[#a5352d] text-white text-[14px] px-5 py-2 rounded-full"
              style={{ fontWeight: 700 }}
            >
              {retrying ? 'Retrying…' : 'Retry'}
            </button>
          </div>
        )}

        {/* Loading state */}
        {!error && loading && (
          <>
            <div className="bg-[#fff0ee] border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] p-[25px] flex flex-col items-center gap-4">
              <div className="size-[96px] rounded-full bg-[#ffdad6] animate-pulse" />
              <div className="h-7 w-40 rounded bg-[#dfbfbc] animate-pulse" />
              <div className="h-5 w-28 rounded bg-[#dfbfbc] animate-pulse" />
            </div>
            <div className="bg-[#f1dcc9] border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] py-6 flex justify-around">
              <div className="h-12 w-20 rounded bg-[#dfbfbc] animate-pulse" />
              <div className="h-12 w-20 rounded bg-[#dfbfbc] animate-pulse" />
            </div>
            <div className="bg-white border border-[#dfbfbc] drop-shadow-[0px_4px_1px_#e6dcc3] rounded-[12px] p-[25px] flex flex-col gap-4">
              <div className="h-5 w-32 rounded bg-[#dfbfbc] animate-pulse" />
              <ChartSkeleton height={192} />
            </div>
            <div className="bg-white border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] p-[25px] flex flex-col gap-4">
              <div className="h-5 w-40 rounded bg-[#dfbfbc] animate-pulse" />
              <ChartSkeleton height={160} />
            </div>
          </>
        )}

        {/* Empty state */}
        {!error && !loading && sessions.length === 0 && (
          <div className="bg-[#fff0ee] border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] p-8 flex flex-col items-center text-center gap-3 mt-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dfbfbc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <p className="text-[#241917] text-[16px]" style={{ fontWeight: 700 }}>
              No sessions yet
            </p>
            <p className="text-[#58413f] text-[14px]">
              Complete your first session to see your progress here.
            </p>
          </div>
        )}

        {/* Main dashboard content */}
        {!error && !loading && sessions.length > 0 && (
          <>
            {/* Profile Header Card */}
            <section className="bg-[#fff0ee] border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] p-[25px] flex flex-col items-center">
              <div className="relative">
                <div className="size-[96px] rounded-full bg-[#ffdad6] border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                  <span className="text-[#a5352d] text-[36px]" style={{ fontWeight: 800 }}>
                    {initial}
                  </span>
                </div>
                <div className="absolute bottom-[-8px] right-[-8px] bg-[#36663e] drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] px-3 py-1 rounded-full">
                  <span className="text-white text-[12px] tracking-[0.96px]" style={{ fontWeight: 800 }}>
                    LVL 4
                  </span>
                </div>
              </div>
              <p className="text-[#241917] text-[24px] leading-[32px] text-center mt-6" style={{ fontWeight: 700 }}>
                {displayName}
              </p>
              <p className="text-[#6b5c4d] text-[18px] leading-[28px] text-center" style={{ fontWeight: 600 }}>
                {latestLevel} Level
              </p>
            </section>

            {/* Achievements */}
            <section className="flex flex-col gap-4">
              <h2 className="text-[#241917] text-[24px] leading-[32px]" style={{ fontWeight: 700 }}>
                Achievements
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Early Bird', iconBg: '#f4dfcc', Icon: EarlyBirdIcon },
                  { label: '5-Day\nStreak', iconBg: '#baf0bc', Icon: StreakIcon },
                  { label: 'Perfect\nRecog.', iconBg: '#ffdad6', Icon: PerfectIcon },
                ].map(({ label, iconBg, Icon }) => (
                  <div
                    key={label}
                    className="bg-[#ffe9e6] border border-[#dfbfbc] rounded-[12px] p-[17px] flex flex-col items-center gap-2"
                  >
                    <div
                      className="size-[56px] rounded-full flex items-center justify-center"
                      style={{ backgroundColor: iconBg }}
                    >
                      <Icon />
                    </div>
                    <span
                      className="text-[#524436] text-[12px] tracking-[0.96px] text-center leading-[15px] whitespace-pre-line"
                      style={{ fontWeight: 800 }}
                    >
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Stats Summary */}
            <section className="bg-[#f1dcc9] border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] flex items-center justify-center gap-10 py-6 px-4">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[#6f6051] text-[12px] tracking-[0.96px]" style={{ fontWeight: 800 }}>
                  ASSESSMENTS
                </span>
                <span className="text-[#241917] text-[24px] leading-[32px]" style={{ fontWeight: 700 }}>
                  {sessions.length}
                </span>
              </div>
              <div className="bg-[#dfbfbc] w-px h-10" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[#6f6051] text-[12px] tracking-[0.96px]" style={{ fontWeight: 800 }}>
                  AVG SCORE
                </span>
                <span className="text-[#241917] text-[24px] leading-[32px]" style={{ fontWeight: 700 }}>
                  {avgScore}%
                </span>
              </div>
            </section>

            {/* Reading Level Chart */}
            <section className="bg-white border border-[#dfbfbc] drop-shadow-[0px_4px_1px_#e6dcc3] rounded-[12px] p-[25px] flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[#58413f] text-[18px] leading-[28px]" style={{ fontWeight: 600 }}>
                  Reading Level
                </span>
                <span className="text-[#58413f] text-[12px] tracking-[0.96px] opacity-60" style={{ fontWeight: 800 }}>
                  ALL SESSIONS
                </span>
              </div>
              <div className="bg-[#fff0ee] rounded-[12px] p-4" style={{ height: 192 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={levelData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: '#58413f', opacity: 0.6, fontFamily: "'Nunito Sans', sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[1, 3]}
                      ticks={[1, 2, 3]}
                      tick={<LevelTick />}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <ReferenceLine
                      y={3}
                      stroke="#36663e"
                      strokeDasharray="4 4"
                      label={{ value: 'GOAL', position: 'right', fontSize: 10, fill: '#36663e', fontFamily: "'Nunito Sans', sans-serif" }}
                    />
                    <Tooltip content={<LevelTooltip />} />
                    <Line
                      dataKey="level"
                      stroke="#a5352d"
                      strokeWidth={2}
                      type="stepAfter"
                      dot={{ fill: '#a5352d', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#a5352d' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* WPM Chart */}
            <section className="bg-white border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] p-[25px] flex flex-col gap-4">
              <div className="flex items-end justify-between">
                <div className="flex flex-col">
                  <span className="text-[#58413f] text-[18px] leading-[28px]" style={{ fontWeight: 600 }}>
                    Words Per{' '}Minute
                  </span>
                  {latestWpm !== null && (
                    <span className="text-[#a5352d] text-[24px] leading-[32px]" style={{ fontWeight: 700 }}>
                      {latestWpm} WPM
                    </span>
                  )}
                </div>
                {improvement !== null && (
                  <div className="flex flex-col items-end">
                    <span
                      className="text-[#36663e] text-[12px] tracking-[0.96px] text-right leading-[16px]"
                      style={{ fontWeight: 800 }}
                    >
                      {improvement >= 0 ? `+${improvement}%` : `${improvement}%`}
                    </span>
                    <span
                      className="text-[#36663e] text-[12px] tracking-[0.96px]"
                      style={{ fontWeight: 800 }}
                    >
                      IMPROVEMENT
                    </span>
                  </div>
                )}
              </div>
              <div className="bg-[#fff0ee] rounded-[8px] p-4" style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={wpmData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#58413f', opacity: 0.6, fontFamily: "'Nunito Sans', sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#58413f', fontFamily: "'Nunito Sans', sans-serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <ReferenceLine
                      y={90}
                      stroke="#a5352d"
                      strokeDasharray="4 4"
                      label={{ value: 'Grade 4 Target', position: 'right', fontSize: 9, fill: '#a5352d', fontFamily: "'Nunito Sans', sans-serif" }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#a5352d',
                        border: 'none',
                        borderRadius: 6,
                        color: '#fff',
                        fontSize: 10,
                        fontFamily: "'Nunito Sans', sans-serif",
                        padding: '2px 8px',
                      }}
                      itemStyle={{ color: '#fff' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Line
                      dataKey="wpm"
                      stroke="#a5352d"
                      strokeWidth={2}
                      type="monotone"
                      dot={{ fill: '#a5352d', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 4, fill: '#a5352d' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
