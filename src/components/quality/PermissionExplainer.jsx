/**
 * PermissionExplainer — the in-app explanation shown BEFORE the browser's
 * native camera/microphone prompt (GO1 'pending' / 'requesting' states).
 *
 * Tapping "Allow" calls onAllow, which triggers getUserMedia (and therefore the
 * native prompt). While the request is in flight, `requesting` disables the
 * button so a double-tap can't open two prompts.
 */
export function PermissionExplainer({ onAllow, requesting }) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-page px-4 py-8 font-display">
      <div className="w-full max-w-[360px]">
        <div className="flex flex-col items-center rounded-[24px] border-2 border-card-border bg-white px-8 pt-10 pb-8 text-center shadow-card">
          {/* Camera + mic illustration */}
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-card text-brand">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m23 7-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>

          <h1 className="text-[24px] font-extrabold leading-[32px] text-ink">
            Let&apos;s get ready to read!
          </h1>
          <p className="mt-3 text-[16px] font-normal leading-[24px] text-ink-soft">
            ReadRight needs your camera and microphone to check your recording
            environment and capture your reading.
          </p>

          <button
            type="button"
            onClick={onAllow}
            disabled={requesting}
            className="mt-8 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-[18px] font-bold leading-[24px] text-white shadow-[0px_4px_0px_#871f1a] disabled:opacity-60"
          >
            {requesting ? (
              'Asking…'
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m23 7-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <span>Allow Camera &amp; Microphone</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
