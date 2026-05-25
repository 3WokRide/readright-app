// RecordingChecks.jsx — live GO1 indicator pills shown while a session records.
//
// Presentational only: renders the four check statuses from useRecordingMonitor
// as compact pills below the passage (Figma "Reading Session"). Per the a11y
// rule, state is conveyed by glyph + label + colour, never colour alone.
const CHECK_META = [
  { key: 'mic', label: 'Mic' },
  { key: 'noise', label: 'Noise' },
  { key: 'camera', label: 'Camera' },
  { key: 'lighting', label: 'Light' },
]

export function RecordingChecks({ checks }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-wrap items-center gap-2">
      {CHECK_META.map(({ key, label }) => {
        const status = checks[key]?.status ?? 'CHECKING'
        const pass = status === 'PASS'
        const fail = status === 'FAIL'
        const tone = pass
          ? 'bg-goal/15 text-goal'
          : fail
            ? 'bg-brand/10 text-brand'
            : 'bg-stat text-ink-muted'
        const glyph = pass ? '✓' : fail ? '✗' : '•'
        const stateLabel = pass ? 'OK' : fail ? 'problem' : 'checking'
        return (
          <span
            key={key}
            aria-label={`${label}: ${stateLabel}`}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold ${tone}`}
          >
            {label}
            <span aria-hidden="true">{glyph}</span>
          </span>
        )
      })}
    </div>
  )
}
