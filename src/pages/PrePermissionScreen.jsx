import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BEIGE = '#FAF3EE'
const RED = '#C0392B'
const TEXT = '#1A1008'
const TEXT_MUTED = '#8B7355'
const BORDER = '#E8DDD4'

export default function PrePermissionScreen() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  async function handleContinue() {
    setLoading(true)
    const isFirstSession = !localStorage.getItem('rr_onboarding_seen')
    localStorage.setItem('rr_onboarding_seen', 'true')
    try {
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    } catch (err) {
        console.warn('Permission denied or unavailable:', err)
    }
    navigate('/quality-check', { state: { isFirstSession } })
    }

  return (
    <div style={{ minHeight: '100vh', background: BEIGE, display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto', fontFamily: "'Georgia', serif" }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: RED, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16 }}>R</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: TEXT }}>ReadRight</span>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: TEXT_MUTED, fontFamily: 'system-ui, sans-serif' }}>SESSION CHECK</span>
      </header>

      <div style={{ flex: 1, padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: '0 0 8px' }}>Before we start</h1>
          <p style={{ fontSize: 15, color: TEXT_MUTED, margin: 0, lineHeight: 1.6, fontFamily: 'system-ui, sans-serif' }}>
            Let's make sure everything is ready so ReadRight can check your reading.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: '📋', title: 'What ReadRight does', body: 'ReadRight will check your environment and record you reading a short passage aloud. An AI will then analyse your reading and show you your results.' },
            { icon: '🎤', title: 'Why we need your microphone', body: 'Your microphone records your voice so the AI can hear how you read each word.' },
            { icon: '📷', title: 'Why we need your camera', body: 'Your camera helps us check your reading posture and habits, like whether you use your finger to follow the text.' },
            { icon: '🔒', title: 'What happens after', body: 'Your recording is only used to analyse this reading session. It is not saved or shared.' },
          ].map(({ icon, title, body }) => (
            <div key={title} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${BORDER}`, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: TEXT, margin: '0 0 4px', fontFamily: 'system-ui, sans-serif' }}>{title}</p>
                <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0, lineHeight: 1.55, fontFamily: 'system-ui, sans-serif' }}>{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '12px 20px 32px' }}>
        <button
          onClick={handleContinue}
          disabled={loading}
          style={{ width: '100%', padding: 16, background: loading ? '#D9C5B8' : RED, color: '#fff', border: 'none', borderRadius: 50, fontSize: 17, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'system-ui, sans-serif' }}
        >
          {loading ? 'Starting...' : 'Got it — Continue'}
        </button>
      </div>
    </div>
  )
}