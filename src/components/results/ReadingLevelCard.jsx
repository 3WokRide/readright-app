import Card from '../ui/Card'
import Badge from '../ui/Badge'
import { levelConfig } from '../../lib/philIri'

/** Reading level badge + child-friendly explanation. */
export default function ReadingLevelCard({ readingLevel }) {
  const level = levelConfig[readingLevel] ?? levelConfig.Instructional
  return (
    <Card className="p-6 flex flex-col items-center gap-4">
      <Badge bg={level.bg} className="px-5 py-2 text-[13px] tracking-[0.96px] font-extrabold">
        {level.label}
      </Badge>
      <p className="text-ink text-[16px] text-center leading-[24px] font-normal">
        {level.explanation}
      </p>
    </Card>
  )
}
