import { LogoMark } from '../icons'
import Avatar from '../ui/Avatar'
import { useCurrentUser } from '../../hooks/useCurrentUser'

/**
 * AppHeader — top bar with the ReadRight wordmark and the learner avatar.
 * Shared across the dashboard and results pages.
 */
export default function AppHeader() {
  const { initial } = useCurrentUser()
  return (
    <header className="bg-header flex items-center justify-between px-5 py-2 shrink-0">
      <div className="flex items-center gap-2">
        <LogoMark />
        <span className="text-brand text-[24px] leading-[32px] font-extrabold">ReadRight</span>
      </div>
      <Avatar initial={initial} size="sm" />
    </header>
  )
}
