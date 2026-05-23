/**
 * PermissionDenied — recovery screen when the camera/microphone could not be
 * started (GO1 'denied' state). One screen whose guidance switches on the
 * classified `errorKind` (and `platform` for the permission case).
 *
 * Accessibility: the failure is signalled with BOTH an icon AND a text title —
 * never colour alone. Copy is plain, age-appropriate, and always ends with a
 * concrete action the learner can take.
 *
 * @param {{ platform: 'ios'|'android'|'other', errorKind: string|null, onRetry: () => void }} props
 */
export function PermissionDenied({ platform, errorKind, onRetry }) {
  const content = getContent(errorKind, platform)

  return (
    <div className="min-h-dvh flex items-center justify-center bg-page px-4 py-8 font-display">
      <div className="w-full max-w-[360px]">
        <div className="flex flex-col items-center rounded-[24px] border-2 border-card-border bg-white px-8 pt-10 pb-8 text-center shadow-card">
          {/* Warning illustration — amber background + icon, not colour alone */}
          <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-[#fdf0d6] text-amber">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </div>

          <h1 className="text-[22px] font-extrabold leading-[28px] text-ink">
            {content.title}
          </h1>

          {content.steps ? (
            <ol className="mt-4 w-full list-decimal space-y-2 pl-6 text-left text-[16px] font-normal leading-[24px] text-ink-soft">
              {content.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-[16px] font-normal leading-[24px] text-ink-soft">
              {content.message}
            </p>
          )}

          {content.note && (
            <p className="mt-4 w-full rounded-[12px] bg-card px-4 py-3 text-left text-[14px] leading-[20px] text-ink-muted">
              {content.note}
            </p>
          )}

          <button
            type="button"
            onClick={onRetry}
            className="mt-8 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-brand py-4 text-[18px] font-bold leading-[24px] text-white shadow-[0px_4px_0px_#871f1a]"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

function getContent(errorKind, platform) {
  if (errorKind === 'permission') {
    if (platform === 'ios') {
      return {
        title: 'We need to see and hear you',
        steps: [
          'Tap the "AA" button at the top of the screen.',
          'Tap "Website Settings".',
          'Set Camera and Microphone to "Allow".',
          'Come back and tap Try Again.',
        ],
        note: 'You can also open the Settings app, then Safari, then turn Camera and Microphone to Allow.',
      }
    }
    return {
      title: 'We need to see and hear you',
      steps: [
        'Tap the lock icon next to the web address at the top.',
        'Tap "Permissions".',
        'Turn Camera and Microphone on.',
        'Tap Try Again.',
      ],
    }
  }

  if (errorKind === 'notfound') {
    return {
      title: 'No camera found',
      message:
        "We can't find a camera on this device. Try ReadRight on a phone or tablet that has a camera, then tap Try Again.",
    }
  }

  if (errorKind === 'inuse') {
    return {
      title: 'Your camera is busy',
      message:
        'Another app may be using your camera. Close your other camera or video apps, then tap Try Again.',
    }
  }

  if (errorKind === 'insecure') {
    return {
      title: 'This page is not secure',
      message:
        'ReadRight needs a secure link to use your camera. Open ReadRight using an https link, then tap Try Again.',
    }
  }

  return {
    title: 'Something stopped your camera',
    message: 'We could not start your camera. Tap Try Again.',
  }
}
