import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { useAuthContext } from '../../context/AuthContext'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'

/**
 * ProfileMenu — the header profile icon (avatar) as a tap target that opens a
 * small dropdown with the learner's name + a Sign out action. Two deliberate
 * taps (open → Sign out) so a learner can't sign out by accident.
 *
 * Signing out clears the persisted Supabase session; AuthGuard would redirect
 * on its own, but we navigate to /login explicitly so it's immediate.
 */
export default function ProfileMenu() {
  const { user, displayName, initial } = useCurrentUser()
  const { signOut } = useAuthContext()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useOnClickOutside(ref, () => setOpen(false), open)

  async function handleSignOut() {
    await signOut()
    setOpen(false)
    navigate('/login', { replace: true })
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full active:bg-black/5"
      >
        <Avatar initial={initial} size="sm" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-[12px] border border-card-border bg-white shadow-card"
        >
          <div className="px-4 py-3">
            <p className="truncate text-[15px] font-bold text-ink">{displayName}</p>
            <p className="truncate text-[12px] text-ink-muted">{user?.email ?? 'Signed in'}</p>
          </div>
          <div className="h-px bg-divider" />
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex min-h-[44px] w-full items-center gap-2 px-4 py-3 text-left text-[15px] font-bold text-brand active:bg-black/5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="m16 17 5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
