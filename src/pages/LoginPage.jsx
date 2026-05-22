// LoginPage.jsx — learner authentication (RR-010, UC-1.1)
// Auth state flows through AuthContext; this page never touches the Supabase
// client directly.
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const navigate = useNavigate()
  const { session, signIn } = useAuthContext()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Already signed in → skip login and go straight to the session screen
  // (routing table: /login redirects to /session if authenticated).
  useEffect(() => {
    if (session) navigate('/session', { replace: true })
  }, [session, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn({ email, password })
    if (error) {
      // Never surface raw Supabase error strings to a Grade 4 learner.
      setError(
        'We could not sign you in. Please check your email and password, then tap Sign In again.'
      )
      setLoading(false)
    } else {
      navigate('/session')
    }
  }

  return (
    <PageShell header={false} centered>
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-brand text-[32px] leading-[40px] font-extrabold">
            ReadRight
          </span>
          <span className="text-ink-muted text-base font-semibold">
            Phil-IRI Oral Reading Assessment
          </span>
        </div>

        {/* Form card */}
        <Card variant="cream" className="w-full p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-ink text-base font-bold" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-card-border rounded-[8px] px-3 py-2 min-h-[44px] text-base text-ink bg-white outline-none focus:border-brand"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-ink text-base font-bold" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-card-border rounded-[8px] px-3 py-2 min-h-[44px] text-base text-ink bg-white outline-none focus:border-brand"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-brand text-base text-center font-semibold">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="mt-1 min-h-[44px]">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    </PageShell>
  )
}
