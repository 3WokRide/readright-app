import Card from '../ui/Card'

/** Total assessment count + average word-recognition score. */
export default function StatsSummaryCard({ count, avgScore }) {
  return (
    <Card variant="stat" className="flex items-center justify-center gap-10 py-6 px-4">
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-muted text-[12px] tracking-[0.96px] font-extrabold">ASSESSMENTS</span>
        <span className="text-ink text-[24px] leading-[32px] font-bold">{count}</span>
      </div>
      <div className="bg-card-border w-px h-10" />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-muted text-[12px] tracking-[0.96px] font-extrabold">AVG SCORE</span>
        <span className="text-ink text-[24px] leading-[32px] font-bold">{avgScore}%</span>
      </div>
    </Card>
  )
}
