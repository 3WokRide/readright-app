// LoginPage.jsx — minimal functional login for development/testing
// Full branded implementation is a separate ticket.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6"
      style={{
        background: 'linear-gradient(90deg, rgba(165,53,45,0.05) 0%, rgba(165,53,45,0.05) 100%), #fff',
        fontFamily: "'Nunito Sans', sans-serif",
      }}
    >
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[#a5352d] text-[32px] leading-[40px]" style={{ fontWeight: 800 }}>
            ReadRight
          </span>
          <span className="text-[#6b5c4d] text-[14px]" style={{ fontWeight: 600 }}>
            Phil-IRI Oral Reading Assessment
          </span>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="w-full bg-[#fff0ee] border border-[#dfbfbc] drop-shadow-[0px_4px_0px_#e6dcc3] rounded-[12px] p-6 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-[#241917] text-[13px]" style={{ fontWeight: 700 }} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border border-[#dfbfbc] rounded-[8px] px-3 py-2 text-[14px] text-[#241917] bg-white outline-none focus:border-[#a5352d]"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[#241917] text-[13px]" style={{ fontWeight: 700 }} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border border-[#dfbfbc] rounded-[8px] px-3 py-2 text-[14px] text-[#241917] bg-white outline-none focus:border-[#a5352d]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[#a5352d] text-[13px] text-center" style={{ fontWeight: 600 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#a5352d] text-white rounded-[8px] py-3 text-[16px] mt-1 disabled:opacity-60"
            style={{ fontWeight: 700 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
