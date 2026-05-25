/**
 * ExitButton — corner control that leaves the current session and returns the
 * learner to their dashboard. Used on /quality-check, /session, and /results so
 * there's always a way out. 44x44 touch target with a plain-language aria-label
 * (CLAUDE.md UI rules). Renders a close (✕) glyph.
 */
export default function ExitButton({ onClick, label = 'Cancel and go back to my dashboard', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-ink active:bg-black/5 ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </button>
  )
}
