import Card from '../ui/Card'
import { BookOpenIcon } from '../icons'

/** Shown when the learner has no sessions yet. */
export default function EmptyState() {
  return (
    <Card variant="cream" className="p-8 flex flex-col items-center text-center gap-3 mt-8">
      <BookOpenIcon />
      <p className="text-ink text-[16px] font-bold">No sessions yet</p>
      <p className="text-ink-soft text-[14px]">
        Complete your first session to see your progress here.
      </p>
    </Card>
  )
}
