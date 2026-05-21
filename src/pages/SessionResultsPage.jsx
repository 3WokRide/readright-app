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
 *   1. Reading Level badge card
 *   2. WPM + Word Recognition side-by-side stat cards
 *   3. Miscue Breakdown (all 6 types, zero-count rows muted)
 *   4. Reading Habits (all 5 behaviors, status badge per flag)
 *   5. Navigation buttons → /dashboard and /session
 *
 * Blocks  : REA-32 · RR-048 (First-Time User Onboarding)
 * Blocked by: REA-8 · RR-004 (FastAPI stub) — api.js stub satisfies this now
 *
 * SRS NFR-U3: Behavioral section MUST use habit-improvement framing.
 *             Never show "FAILED" or negative labels.
 * SRS NFR-P2: Must render within 3 seconds of receiving data.
 */
import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { submitRecording } from '../lib/api'

// --- Config ---

const levelConfig = {
  Independent: {
    bg: '#36663e',
    label: 'INDEPENDENT',
    explanation: 'You read this passage mostly on your own. Great job!',
  },
  Instructional: {
    bg: '#36663e',
    label: 'INSTRUCTIONAL',
    explanation: 'This means you read most of the passage well! Keep practicing to reach Independent level.',
  },
  Frustration: {
    bg: '#a5352d',
    label: 'FRUSTRATION',
    explanation: "This passage was very challenging. Keep practising — you'll get there!",
  },
}

const miscueKeys = [
  'mispronunciation', 'substitution', 'omission',
  'insertion', 'repetition', 'refusal_to_pronounce',
]

const miscueLabels = {
  mispronunciation:     'Mispronunciation',
  substitution:         'Substitution',
  omission:             'Omission',
  insertion:            'Insertion',
  repetition:           'Repetition',
  refusal_to_pronounce: 'Refusal to Pronounce',
}

const behaviorRows = [
  { key: 'finger_pointing',      label: 'Finger Pointing', desc: 'Helps maintain place in text' },
  { key: 'loss_of_place',        label: 'Loss of Place',   desc: 'Try using a steady reading pace' },
  { key: 'monotone_reading',     label: 'Prosody',         desc: 'Expression and phrasing' },
  { key: 'word_by_word_reading', label: 'Word by Word',    desc: 'Try reading phrases together' },
  { key: 'inaudible_reading',    label: 'Amplitude',       desc: 'Volume consistency' },
]

const wrRange = (pct) =>
  pct >= 97 ? { label: 'Independent: Above 97%', color: '#36663e' }
  : pct >= 91 ? { label: 'Instructional: 91–96%', color: '#36663e' }
  : { label: 'Frustration: Below 91%', color: '#a5352d' }

// --- Small SVG components ---

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

function CheckCircle({ color = '#36663e' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
      <circle cx="12" cy="12" r="12" fill={color}/>
      <path d="M7 12l3.5 3.5L17 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}

function EmptyCircle() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#c4c4c4" strokeWidth="2"/>
    </svg>
  )
}

// --- Skeleton shimmer ---

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-[#efe8e7] rounded-[8px] ${className}`} />
}

function LoadingSkeleton() {
  return (
    <>
      <Skeleton className="h-[140px] w-full" />
      <div className="flex gap-4">
        <Skeleton className="flex-1 h-[110px]" />
        <Skeleton className="flex-1 h-[110px]" />
      </div>
      <Skeleton className="h-[220px] w-full" />
      <Skeleton className="h-[280px] w-full" />
      <Skeleton className="h-[100px] w-full" />
    </>
  )
}

// --- Main page ---

export default function SessionResultsPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [result, setResult] = useState(state ?? null)
  const [loading, setLoading] = useState(!state)
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null))
  }, [])

  useEffect(() => {
    if (!state) {
      submitRecording(null, 'phil-iri-g4-p1').then((r) => {
        setResult(r)
        setLoading(false)
      })
    }
  }, [state])

  const initial = (
    user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'L'
  ).charAt(0).toUpperCase()

  const level = result ? (levelConfig[result.reading_level] ?? levelConfig.Instructional) : null
  const maxMiscue = result
    ? Math.max(...miscueKeys.map((k) => result[k] ?? 0), 1)
    : 1

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{
        background: 'linear-gradient(90deg, rgba(165,53,45,0.05) 0%, rgba(165,53,45,0.05) 100%), #fff',
        fontFamily: "'Nunito Sans', sans-serif",
      }}
    >
      {/* Header */}
      <header className="bg-[#fff8f7] flex items-center justify-between px-5 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <svg width="30" height="28" viewBox="0 0 30 28" fill="none">
            <rect width="30" height="28" rx="4" fill="#a5352d"/>
            <text x="5" y="20" fontSize="16" fontWeight="800" fill="white" fontFamily="sans-serif">R</text>
          </svg>
          <span className="text-[#a5352d] text-[24px] leading-[32px]" style={{ fontWeight: 800 }}>
            ReadRight
          </span>
        </div>
        <div className="size-[40px] rounded-full bg-[#a5352d] border-2 border-white flex items-center justify-center shadow-sm">
          <span className="text-white text-[18px]" style={{ fontWeight: 700 }}>{initial}</span>
        </div>
      </header>

      {/* Main scroll */}
      <main className="flex flex-col gap-6 pt-6 px-5 pb-24">

        {loading && <LoadingSkeleton />}

        {!loading && result && (
          <>
            {/* 1. Reading Level Card */}
            <section className="bg-white border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] p-6 flex flex-col items-center gap-4">
              <span
                className="text-white text-[13px] tracking-[0.96px] px-5 py-2 rounded-full"
                style={{ backgroundColor: level.bg, fontWeight: 800 }}
              >
                {level.label}
              </span>
              <p className="text-[#241917] text-[16px] text-center leading-[24px]" style={{ fontWeight: 400 }}>
                {level.explanation}
              </p>
            </section>

            {/* 2. Stats Row */}
            <div className="flex gap-4">
              {/* WPM */}
              <div className="flex-1 bg-white border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] p-5 flex flex-col">
                <span className="text-[#a5352d] leading-none" style={{ fontWeight: 700, fontSize: 48 }}>
                  {Math.round(result.wpm)}
                </span>
                <span className="text-[#6f6051] text-[11px] tracking-[0.96px] mt-1" style={{ fontWeight: 800 }}>
                  WORDS PER MINUTE
                </span>
                <span className="text-[#6f6051] text-[12px] mt-2">
                  Grade 4 target: 80 WPM
                </span>
              </div>

              {/* Word Recognition */}
              <div className="flex-1 bg-white border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] p-5 flex flex-col">
                <span className="text-[#36663e] leading-none" style={{ fontWeight: 700, fontSize: 48 }}>
                  {Math.round(result.word_recognition_pct)}%
                </span>
                <span className="text-[#6f6051] text-[11px] tracking-[0.96px] mt-1" style={{ fontWeight: 800 }}>
                  WORD RECOGNITION
                </span>
                <span
                  className="text-[12px] mt-2"
                  style={{ color: wrRange(result.word_recognition_pct).color }}
                >
                  {wrRange(result.word_recognition_pct).label}
                </span>
              </div>
            </div>

            {/* 3. Miscue Breakdown */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[#241917] text-[20px]" style={{ fontWeight: 700 }}>
                  Miscue Breakdown
                </h2>
                <InfoIcon />
              </div>
              <div className="bg-white border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] p-5 flex flex-col">
                {miscueKeys.map((key, i) => {
                  const count = result[key] ?? 0
                  const muted = count === 0
                  const barWidth = muted ? 0 : Math.round((count / maxMiscue) * 100)
                  return (
                    <div key={key}>
                      {i > 0 && <div className="bg-[#f5eeee] h-px my-3" />}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-[14px]"
                          style={{ fontWeight: 600, color: muted ? '#c4b8b8' : '#241917' }}
                        >
                          {miscueLabels[key]}
                        </span>
                        <span
                          className="text-[14px]"
                          style={{ fontWeight: 700, color: muted ? '#c4b8b8' : '#a5352d' }}
                        >
                          {count}
                        </span>
                      </div>
                      <div className="bg-[#ffdad6] h-[8px] rounded-full overflow-hidden">
                        <div
                          className="bg-[#a5352d] h-full rounded-full transition-all"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 4. Reading Habits */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-[#241917] text-[20px]" style={{ fontWeight: 700 }}>
                  Reading Habits
                </h2>
                <InfoIcon />
              </div>
              <div className="bg-white border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] p-5 flex flex-col">
                <p className="text-[#58413f] text-[13px] mb-4">
                  Behaviors noticed during your session:
                </p>
                {behaviorRows.map(({ key, label, desc }, i) => {
                  const observed = !!result[key]
                  return (
                    <div key={key}>
                      {i > 0 && <div className="bg-[#f5eeee] h-px my-3" />}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[#241917] text-[15px]" style={{ fontWeight: 700 }}>
                            {label}
                          </span>
                          <span className="text-[#58413f] text-[11px]">{desc}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-3">
                          <span
                            className="text-[12px]"
                            style={{ fontWeight: 600, color: observed ? '#e6a817' : '#36663e' }}
                          >
                            {observed ? 'Noted' : 'Good'}
                          </span>
                          {observed ? <CheckCircle color="#e6a817" /> : <CheckCircle color="#36663e" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* 5. Navigation */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-[#a5352d] text-white py-3 rounded-[8px] text-[16px]"
                style={{ fontWeight: 700 }}
              >
                See My Progress
              </button>
              <button
                onClick={() => navigate('/session')}
                className="w-full bg-white text-[#a5352d] border border-[#a5352d] py-3 rounded-[8px] text-[16px]"
                style={{ fontWeight: 700 }}
              >
                Try Another Passage
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
