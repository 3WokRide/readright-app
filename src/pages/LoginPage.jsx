// LoginPage.jsx — minimal functional login for development/testing
// Full branded implementation is a separate ticket.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
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
          <span className="text-ink-muted text-[14px] font-semibold">
            Phil-IRI Oral Reading Assessment
          </span>
        </div>

        {/* Form card */}
        <Card variant="cream" className="w-full p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-ink text-[13px] font-bold" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-card-border rounded-[8px] px-3 py-2 text-[14px] text-ink bg-white outline-none focus:border-brand"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-ink text-[13px] font-bold" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-card-border rounded-[8px] px-3 py-2 text-[14px] text-ink bg-white outline-none focus:border-brand"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-brand text-[13px] text-center font-semibold">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="mt-1">
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
        </Card>
      </div>
    </PageShell>
  )
}
