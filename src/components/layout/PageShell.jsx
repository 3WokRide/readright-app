import AppHeader from './AppHeader'

/**
 * PageShell — app page chrome: full-height column, page background, display font.
 *   header   — render the shared AppHeader (default true)
 *   centered — center children (used by the login screen) instead of the
 *              standard top-aligned scroll layout
 *   onExit   — when set, AppHeader shows a ✕ that returns to the dashboard
 */
export default function PageShell({ children, header = true, centered = false, onExit }) {
  return (
    <div className="min-h-dvh flex flex-col bg-page font-display">
      {header && <AppHeader onExit={onExit} />}
      <main
        className={
          centered
            ? 'flex-1 flex flex-col items-center justify-center px-6'
            : 'flex-1 flex flex-col gap-6 pt-6 px-5 pb-24 w-full max-w-[480px] mx-auto'
        }
      >
        {children}
      </main>
    </div>
  )
}
