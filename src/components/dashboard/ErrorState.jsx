import { useState } from 'react'

/** Shown when the sessions query fails; offers a reload retry. */
export default function ErrorState() {
  const [retrying, setRetrying] = useState(false)

  function handleRetry() {
    setRetrying(true)
    window.location.reload()
  }

  return (
    <div className="bg-card border border-card-border rounded-[12px] p-6 flex flex-col items-center gap-4 text-center">
      <p className="text-ink text-[16px] font-semibold">Unable to load your progress.</p>
      <p className="text-ink-soft text-[14px]">
        Please check your connection and try again.
      </p>
      <button
        onClick={handleRetry}
        className="bg-brand text-white text-[14px] px-5 py-2 rounded-full font-bold"
      >
        {retrying ? 'Retrying…' : 'Retry'}
      </button>
    </div>
  )
}
