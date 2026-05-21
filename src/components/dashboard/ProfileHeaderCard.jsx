import Card from '../ui/Card'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import { useCurrentUser } from '../../hooks/useCurrentUser'

/** Profile header: large avatar + LVL badge, learner name, latest reading level. */
export default function ProfileHeaderCard({ latestLevel }) {
  const { displayName, initial } = useCurrentUser()

  const lvlBadge = (
    <Badge
      bg="var(--color-goal)"
      className="absolute bottom-[-8px] right-[-8px] px-3 py-1 text-[12px] tracking-[0.96px] font-extrabold drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)]"
    >
      LVL 4
    </Badge>
  )

  return (
    <Card variant="cream" className="p-[25px] flex flex-col items-center">
      <Avatar initial={initial} size="lg" badge={lvlBadge} />
      <p className="text-ink text-[24px] leading-[32px] text-center mt-6 font-bold">
        {displayName}
      </p>
      <p className="text-ink-muted text-[18px] leading-[28px] text-center font-semibold">
        {latestLevel} Level
      </p>
    </Card>
  )
}
