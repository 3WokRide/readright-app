import Card from '../ui/Card'
import { InfoIcon, CheckCircle } from '../icons'
import { behaviorRows } from '../../lib/philIri'

/**
 * All 5 behavioral flags with a status badge. Uses habit-improvement framing
 * (SRS NFR-U3): observed habits read "Noted", never "FAILED".
 */
export default function ReadingHabits({ result }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-ink text-[20px] font-bold">Reading Habits</h2>
        <InfoIcon />
      </div>
      <Card className="p-5 flex flex-col">
        <p className="text-ink-soft text-[13px] mb-4">
          Behaviors noticed during your session:
        </p>
        {behaviorRows.map(({ key, label, desc }, i) => {
          const observed = !!result[key]
          const color = observed ? 'var(--color-amber)' : 'var(--color-goal)'
          return (
            <div key={key}>
              {i > 0 && <div className="bg-divider h-px my-3" />}
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="text-ink text-[15px] font-bold">{label}</span>
                  <span className="text-ink-soft text-[11px]">{desc}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  <span
                    className={`text-[12px] font-semibold ${observed ? 'text-amber' : 'text-goal'}`}
                  >
                    {observed ? 'Noted' : 'Good'}
                  </span>
                  <CheckCircle color={color} />
                </div>
              </div>
            </div>
          )
        })}
      </Card>
    </section>
  )
}
