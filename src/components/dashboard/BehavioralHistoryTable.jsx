import Card from '../ui/Card'
import { InfoIcon } from '../icons'

/**
 * Behavioral History (REA-33 · RR-049) — Figma "My Profile" node 5:458.
 *
 * A table of the learner's last 5 sessions (columns = session dates) × the 5
 * Phil-IRI behaviours (rows). Each cell is ✓ (not detected — good) or ✗
 * (detected). Marks differ in icon AND colour with an aria-label, never colour
 * alone (NFR-U1).
 *
 * Framing (NFR-U3): the header reads "Reading Habits" — never "Behavioral Flags"
 * or "Errors" — and detected habits are framed neutrally as habits to improve.
 *
 * Consumes the shared useSessionHistory() shape — sessions arrive oldest →
 * newest, so we take the last 5.
 */

const BEHAVIORS = [
  { key: 'finger_pointing', label: 'Finger Pointing' },
  { key: 'loss_of_place', label: 'Loss of Place' },
  { key: 'monotone_reading', label: 'Monotone Reading' },
  { key: 'word_by_word_reading', label: 'Word by Word' },
  { key: 'inaudible_reading', label: 'Inaudible Reading' },
]

const NotDetected = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Not detected"><title>Not detected</title><path d="m5 13 4 4L19 7" /></svg>
)
const Detected = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" role="img" aria-label="Detected"><title>Detected</title><path d="M6 6l12 12M18 6 6 18" /></svg>
)

function sessionLabel(session, index) {
  const ts = session?.session_timestamp
  if (!ts) return `S${index + 1}`
  return new Date(ts).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
}

export default function BehavioralHistoryTable({ sessions }) {
  const recent = sessions.slice(-5) // last 5, oldest → newest

  return (
    <Card className="p-[25px] flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-ink-soft text-[18px] leading-[28px] font-semibold">Reading Habits</h2>
        <InfoIcon />
      </div>

      {recent.length === 0 ? (
        <p className="text-ink-soft text-[14px] leading-[20px]">
          Complete more sessions to see your habits over time.
        </p>
      ) : (
        <>
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr>
                <th className="text-ink-soft text-[11px] font-extrabold tracking-[0.04em] text-left pb-2 w-[40%]">
                  HABIT
                </th>
                {recent.map((s, i) => (
                  <th key={i} className="text-ink-muted text-[11px] font-bold text-center pb-2 tabular-nums">
                    {sessionLabel(s, i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BEHAVIORS.map(({ key, label }, rowIdx) => (
                <tr key={key} className={rowIdx > 0 ? 'border-t border-divider' : undefined}>
                  <td className="text-ink text-[13px] font-semibold py-2 pr-2 align-middle">{label}</td>
                  {recent.map((s, i) => {
                    const detected = !!s[key]
                    return (
                      <td key={i} className="py-2 text-center align-middle">
                        <span className={`inline-flex justify-center ${detected ? 'text-brand' : 'text-goal'}`}>
                          {detected ? Detected : NotDetected}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center gap-4 text-[11px] text-ink-soft">
            <span className="flex items-center gap-1">
              <span className="text-goal">{NotDetected}</span> Not detected
            </span>
            <span className="flex items-center gap-1">
              <span className="text-brand">{Detected}</span> Detected
            </span>
          </div>
        </>
      )}
    </Card>
  )
}
