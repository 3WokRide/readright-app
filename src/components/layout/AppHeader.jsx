import { LogoMark } from '../icons'
import ExitButton from '../ui/ExitButton'
import ProfileMenu from './ProfileMenu'

/**
 * AppHeader — top bar with the ReadRight wordmark and the learner's profile
 * menu (avatar → Sign out). Shared across the dashboard and results pages. When
 * `onExit` is given (e.g. the results screen), a ✕ control on the left returns
 * to the dashboard.
 */
export default function AppHeader({ onExit }) {
  return (
    <header className="bg-header shrink-0 px-5 py-2">
      <div className="mx-auto flex w-full max-w-[480px] items-center justify-between">
        <div className="flex items-center gap-2">
          {onExit && <ExitButton onClick={onExit} label="Go back to my dashboard" className="-ml-2" />}
          <LogoMark />
          <span className="text-brand text-[24px] leading-[32px] font-extrabold">ReadRight</span>
        </div>
        <ProfileMenu />
      </div>
    </header>
  )
}
