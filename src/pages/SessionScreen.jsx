// SessionScreen.jsx — STUB (RR-003)
// Full implementation assigned to the team member owning this page.
import { useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRandomPassage } from '../data/passages'
import { submitRecording } from '../lib/api'

const MAX_RECORDING_MS = 5 * 60 * 1000

const STEPS = ['UPLOADING', 'TRANSCRIBING', 'SCORING', 'DONE']

export default function SessionScreen() {
  const passage = useMemo(() => getRandomPassage(), [])
  const navigate = useNavigate()

  const [status, setStatus] = useState('idle') // 'idle' | 'recording' | 'processing'
  const [elapsed, setElapsed] = useState(0)
  const [processingStep, setProcessingStep] = useState(0)

  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const autoStopRef = useRef(null)
  const processingTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      clearTimeout(autoStopRef.current)
      clearInterval(processingTimerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const formatElapsed = (s) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    streamRef.current = stream

    const mimeType = MediaRecorder.isTypeSupported('video/mp4')
      ? 'video/mp4'
      : 'video/webm;codecs=vp8,opus'

    const mediaRecorder = new MediaRecorder(stream, { mimeType })
    mediaRecorderRef.current = mediaRecorder
    chunksRef.current = []

    mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    mediaRecorder.onstop = async () => {
      clearInterval(timerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())

      const blob = new Blob(chunksRef.current, { type: mimeType })
      const ext = mimeType.includes('mp4') ? 'mp4' : 'webm'
      const file = new File([blob], `recording.${ext}`, { type: mimeType })

      setStatus('processing')
      setProcessingStep(0)

      // Simulate step progression while waiting
      let step = 0
      processingTimerRef.current = setInterval(() => {
        step += 1
        if (step < STEPS.length - 1) setProcessingStep(step)
      }, 800)

      try {
        const result = await submitRecording(file, passage.id)
        clearInterval(processingTimerRef.current)
        setProcessingStep(STEPS.length - 1)
        setTimeout(() => navigate('/results', { state: { result, passage } }), 400)
      } catch (err) {
        console.error(err)
        clearInterval(processingTimerRef.current)
        setStatus('idle')
      }
    }

    mediaRecorder.start()
    setStatus('recording')
    setElapsed(0)
    timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    autoStopRef.current = setTimeout(() => mediaRecorder.stop(), MAX_RECORDING_MS)
  }

  function stopRecording() {
    clearTimeout(autoStopRef.current)
    mediaRecorderRef.current?.stop()
  }

  if (status === 'processing') {
    return (
      <div style={styles.screen}>
        <header style={styles.header}>
          <div style={styles.logo}>
            <div style={styles.logoIcon}>R</div>
            <span style={styles.logoText}>ReadRight</span>
          </div>
        </header>

        <div style={styles.processingBody}>
          <div style={styles.processingIllustration}>
            <div style={styles.personCircle} />
            <div style={styles.docCard}>R</div>
            <div style={styles.magnifier}>
              <div style={styles.magnifierGlass} />
            </div>
          </div>

          <h2 style={styles.processingTitle}>Analyzing your reading...</h2>
          <p style={styles.processingSubtitle}>This usually takes less than a minute. Please wait.</p>

          <div style={styles.stepsRow}>
            {STEPS.map((step, i) => {
              const done = i < processingStep
              const active = i === processingStep
              return (
                <div key={step} style={styles.stepItem}>
                  {i > 0 && (
                    <div style={{
                      ...styles.stepLine,
                      background: done ? '#2D6A4F' : '#D9C5B8'
                    }} />
                  )}
                  <div style={{
                    ...styles.stepDot,
                    background: done ? '#2D6A4F' : active ? '#C0392B' : '#D9C5B8',
                    border: active ? '3px solid #C0392B' : 'none',
                  }}>
                    {done && <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>✓</span>}
                    {active && <div style={styles.stepActiveDot} />}
                  </div>
                  <span style={{
                    ...styles.stepLabel,
                    color: active ? '#C0392B' : done ? '#2D6A4F' : '#B0A090',
                    fontWeight: active || done ? 600 : 400,
                  }}>{step}</span>
                </div>
              )
            })}
          </div>

          <div style={styles.warningBox}>
            <span style={styles.warningIcon}>i</span>
            <p style={styles.warningText}>Do not close this screen while your reading is being analyzed.</p>
          </div>

          <p style={styles.poweredBy}>Powered by Phil-IRI Assessment Engine</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.screen}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>R</div>
          <span style={styles.logoText}>ReadRight</span>
        </div>
        <span style={styles.headerLabel}>READING SESSION</span>
      </header>

      <div style={styles.body}>
        <div style={styles.passageCard}>
          <div style={styles.passageCardHeader}>
            <h2 style={styles.passageTitle}>{passage.title}</h2>
            <span style={styles.easyBadge}>EASY</span>
          </div>
          <p style={styles.passageText}>{passage.text}</p>
        </div>

        <p style={{ textAlign: 'center', fontSize: 14, color: TEXT_MUTED, padding: '0 16px', fontFamily: 'system-ui, sans-serif' }}>
          Read this passage aloud, clearly and at your normal pace.
        </p>

        {status === 'recording' && (
          <div style={styles.recordingBar}>
            <span style={styles.recordingDot} />
            <span style={styles.recordingLabel}>Recording...</span>
            <div style={styles.waveform}>
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} style={{
                  ...styles.waveBar,
                  animationDelay: `${i * 0.08}s`,
                }} />
              ))}
            </div>
            <span style={styles.timer}>{formatElapsed(elapsed)}</span>
          </div>
        )}

        {status === 'recording' && (
          <div style={styles.checksRow}>
            {['Mic', 'Noise', 'Camera', 'Light'].map(label => (
              <span key={label} style={styles.checkPill}>
                {label} <span style={styles.checkMark}>✓</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={styles.footer}>
        {status === 'idle' ? (
          <button onClick={startRecording} style={styles.startBtn}>
            <span style={styles.startBtnDot} />
            Start Recording
          </button>
        ) : (
          <button onClick={stopRecording} style={styles.stopBtn}>
            <span style={styles.stopBtnSquare} />
            Stop Recording
          </button>
        )}
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { height: 6px; }
          50% { height: 22px; }
        }
      `}</style>
    </div>
  )
}

const BEIGE = '#FAF3EE'
const CARD_BG = '#FFFFFF'
const RED = '#C0392B'
const RED_LIGHT = '#F9ECEB'
const GREEN = '#2D6A4F'
const GREEN_LIGHT = '#E8F5EF'
const TEXT = '#1A1008'
const TEXT_MUTED = '#8B7355'
const BORDER = '#E8DDD4'

const styles = {
  screen: {
    minHeight: '100vh',
    background: BEIGE,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Georgia', serif",
    maxWidth: 480,
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: `1px solid ${BORDER}`,
    background: CARD_BG,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: RED,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 16,
  },
  logoText: {
    fontWeight: 700,
    fontSize: 18,
    color: TEXT,
    fontFamily: "'Georgia', serif",
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: TEXT_MUTED,
    fontFamily: 'system-ui, sans-serif',
  },
  body: {
    flex: 1,
    padding: '20px 16px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  passageCard: {
    background: CARD_BG,
    borderRadius: 16,
    border: `1px solid ${BORDER}`,
    padding: '20px 18px',
  },
  passageCardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  passageTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: TEXT,
    margin: 0,
  },
  easyBadge: {
    background: GREEN_LIGHT,
    color: GREEN,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
    padding: '4px 10px',
    borderRadius: 20,
    fontFamily: 'system-ui, sans-serif',
  },
  passageText: {
    fontSize: 18,
    lineHeight: 1.85,
    color: TEXT,
    margin: 0,
  },
  recordingBar: {
    background: RED_LIGHT,
    border: `1px solid #F0C8C4`,
    borderRadius: 12,
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    background: RED,
    flexShrink: 0,
  },
  recordingLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: RED,
    fontFamily: 'system-ui, sans-serif',
  },
  waveform: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flex: 1,
    height: 28,
  },
  waveBar: {
    width: 3,
    height: 6,
    borderRadius: 2,
    background: RED,
    animation: 'wave 0.6s ease-in-out infinite',
    flexShrink: 0,
  },
  timer: {
    fontSize: 15,
    fontWeight: 600,
    color: TEXT,
    fontFamily: 'system-ui, sans-serif',
    flexShrink: 0,
  },
  checksRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  checkPill: {
    background: GREEN_LIGHT,
    color: GREEN,
    fontSize: 12,
    fontWeight: 600,
    padding: '5px 12px',
    borderRadius: 20,
    fontFamily: 'system-ui, sans-serif',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  checkMark: {
    fontSize: 11,
  },
  footer: {
    padding: '12px 16px 32px',
  },
  startBtn: {
    width: '100%',
    padding: '16px',
    background: RED,
    color: '#fff',
    border: 'none',
    borderRadius: 50,
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    fontFamily: 'system-ui, sans-serif',
  },
  startBtnDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: '#fff',
  },
  stopBtn: {
    width: '100%',
    padding: '16px',
    background: 'transparent',
    color: RED,
    border: `2.5px solid ${RED}`,
    borderRadius: 50,
    fontSize: 17,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    fontFamily: 'system-ui, sans-serif',
  },
  stopBtnSquare: {
    width: 14,
    height: 14,
    borderRadius: 3,
    background: RED,
  },
  // Processing screen
  processingBody: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 20px 24px',
    gap: 0,
  },
  processingIllustration: {
    position: 'relative',
    width: 160,
    height: 160,
    marginBottom: 28,
  },
  personCircle: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 100,
    height: 110,
    borderRadius: '50% 50% 45% 45%',
    background: RED,
  },
  docCard: {
    position: 'absolute',
    top: 20,
    right: 8,
    width: 52,
    height: 64,
    background: '#FAF3EE',
    border: `2px solid ${RED}`,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: 18,
    color: RED,
    transform: 'rotate(8deg)',
  },
  magnifier: {
    position: 'absolute',
    bottom: 16,
    left: 8,
    width: 44,
    height: 44,
  },
  magnifierGlass: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: `4px solid #1A1008`,
    background: 'rgba(255,255,255,0.5)',
  },
  processingTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: TEXT,
    margin: '0 0 8px',
    textAlign: 'center',
  },
  processingSubtitle: {
    fontSize: 14,
    color: TEXT_MUTED,
    textAlign: 'center',
    margin: '0 0 28px',
    lineHeight: 1.5,
    fontFamily: 'system-ui, sans-serif',
  },
  stepsRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 0,
    marginBottom: 24,
    width: '100%',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  stepLine: {
    position: 'absolute',
    top: 14,
    right: '50%',
    width: '100%',
    height: 2,
    background: '#D9C5B8',
    zIndex: 0,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: '#D9C5B8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    marginBottom: 6,
    position: 'relative',
  },
  stepActiveDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#C0392B',
  },
  stepLabel: {
    fontSize: 9,
    letterSpacing: '0.06em',
    color: TEXT_MUTED,
    fontFamily: 'system-ui, sans-serif',
    textAlign: 'center',
  },
  warningBox: {
    background: '#FEF9F0',
    border: '1px solid #F0DFC0',
    borderRadius: 10,
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
    marginBottom: 'auto',
  },
  warningIcon: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: '#E8A020',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontFamily: 'system-ui, sans-serif',
  },
  warningText: {
    fontSize: 13,
    color: TEXT,
    margin: 0,
    lineHeight: 1.5,
    fontFamily: 'system-ui, sans-serif',
  },
  poweredBy: {
    fontSize: 11,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 24,
    fontFamily: 'system-ui, sans-serif',
  },
}