// RecordingChecks.jsx — live GO1 indicator strip shown while a session records.
//
// Presentational only: renders the four check statuses from useRecordingMonitor
// as a compact row below the passage. Per the a11y rule, state is conveyed by
// icon + label + glyph, never colour alone.
const CHECK_META = [
  { key: 'mic', icon: '🎤', label: 'Mic' },
  { key: 'noise', icon: '🔊', label: 'Noise' },
  { key: 'lighting', icon: '☀️', label: 'Light' },
  { key: 'camera', icon: '👤', label: 'Camera' },
]

export function RecordingChecks({ checks }) {
  return (
    <div role="status" aria-live="polite" className="flex items-stretch gap-2">
      {CHECK_META.map(({ key, icon, label }) => {
        const status = checks[key]?.status ?? 'CHECKING'
        const pass = status === 'PASS'
        const fail = status === 'FAIL'
        const tone = pass
          ? 'border-goal/30 bg-goal/10 text-goal'
          : fail
            ? 'border-brand/30 bg-brand/5 text-brand'
            : 'border-card-border bg-white text-ink-muted'
        const glyph = pass ? '✓' : fail ? '✗' : '•'
        const stateLabel = pass ? 'OK' : fail ? 'problem' : 'checking'
        return (
          <div
            key={key}
            aria-label={`${label}: ${stateLabel}`}
            className={`flex flex-1 flex-col items-center gap-1 rounded-[10px] border px-1 py-2 ${tone}`}
          >
            <span className="text-[16px] leading-none" aria-hidden="true">{icon}</span>
            <span className="flex items-center gap-1 text-[13px] font-semibold leading-none">
              <span aria-hidden="true">{glyph}</span>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
