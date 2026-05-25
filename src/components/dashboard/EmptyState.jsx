import Card from '../ui/Card'
import { BookOpenIcon } from '../icons'

/** Shown when the learner has no sessions yet. `onStart` opens the GO1 gate. */
export default function EmptyState({ onStart }) {
  return (
    <Card variant="cream" className="p-8 flex flex-col items-center text-center gap-3 mt-8">
      <BookOpenIcon />
      <p className="text-ink text-[16px] font-bold">No readings yet</p>
      <p className="text-ink-soft text-[14px]">
        Read your first passage to see your progress here.
      </p>
      {onStart && (
        <button
          type="button"
          onClick={onStart}
          className="mt-2 flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-brand px-8 py-3 text-[16px] font-extrabold text-white shadow-[0px_4px_0px_#871f1a]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
          Start My First Reading
        </button>
      )}
    </Card>
  )
}
