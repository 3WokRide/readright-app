import Card from '../ui/Card'
import { InfoIcon } from '../icons'
import { miscueKeys, miscueLabels } from '../../lib/philIri'

/** All 6 miscue types with proportional bars; zero-count rows are muted. */
export default function MiscueBreakdown({ result }) {
  const maxMiscue = Math.max(...miscueKeys.map((k) => result[k] ?? 0), 1)
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-ink text-[20px] font-bold">Miscue Breakdown</h2>
        <InfoIcon />
      </div>
      <Card className="p-5 flex flex-col">
        {miscueKeys.map((key, i) => {
          const count = result[key] ?? 0
          const muted = count === 0
          const barWidth = muted ? 0 : Math.round((count / maxMiscue) * 100)
          return (
            <div key={key}>
              {i > 0 && <div className="bg-divider h-px my-3" />}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[14px] font-semibold ${muted ? 'text-faint' : 'text-ink'}`}>
                  {miscueLabels[key]}
                </span>
                <span className={`text-[14px] font-bold ${muted ? 'text-faint' : 'text-brand'}`}>
                  {count}
                </span>
              </div>
              <div className="bg-soft h-[8px] rounded-full overflow-hidden">
                <div
                  className="bg-brand h-full rounded-full transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          )
        })}
      </Card>
    </section>
  )
}
