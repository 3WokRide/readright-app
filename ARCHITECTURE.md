# ARCHITECTURE.md — ReadRight Frontend Architecture

> Concise reference for the React.js PWA frontend of ReadRight.
> Three-tier system: React PWA → FastAPI AI Microservice → Supabase (Auth + PostgreSQL).

---

## System Overview

```
Browser (React PWA)
  │
  ├─ getUserMedia / MediaRecorder / Web Audio / Canvas / MediaPipe WASM
  │    (GO1 quality checks — client-side only, never transmitted)
  │
  ├─── HTTPS POST multipart/form-data (MP4 + passage_id)
  │         └─► FastAPI /analyze
  │                  └─► GO2 (WhisperX ASR, MiscueClassifier, ScoringEngine)
  │                  └─► GO3 (MediaPipe CV, librosa, Parselmouth) [parallel]
  │                  └─► Supabase INSERT sessions (direct write)
  │                  └─► Returns AssessmentResultJSON to frontend
  │
  └─── HTTPS REST via @supabase/supabase-js SDK (Bearer JWT)
            └─► Supabase Auth (login, token refresh)
            └─► Supabase PostgREST (sessions table INSERT + SELECT)
```

The FastAPI microservice writes the session record to Supabase directly on pipeline completion. The frontend does **not** relay results through itself for storage — it writes the same record independently via `useSessionStorage` (UC-4.2) as a reliability layer.

---

## Folder Structure

```
readright-app/
├── public/
│   ├── manifest.json           # PWA Web App Manifest (name, icons, display: standalone)
│   ├── sw.js                   # Hand-rolled install-only Service Worker (network passthrough, no caching)
│   └── icons/                  # PWA home screen icons (192px, 512px)
├── src/
│   ├── main.jsx                # React DOM root, router setup
│   ├── App.jsx                 # Route definitions (createBrowserRouter)
│   ├── index.css               # Tailwind v4 entry (@import "tailwindcss";) + base resets only
│   │
│   ├── lib/
│   │   └── supabase.js         # Single Supabase client instance (createClient)
│   │
│   ├── pages/                  # One file per route — non-critical routes are lazy loaded
│   │   ├── LoginPage.jsx
│   │   ├── SessionScreen.jsx        # GO1 + RecordingGate + ProcessingScreen
│   │   ├── SessionResultsPage.jsx   # Results display + useSessionStorage
│   │   └── DashboardPage.jsx        # PersonalProgressDashboard (trend charts + panels)
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthGuard.jsx           # Redirects unauthenticated users to /login
│   │   ├── session/
│   │   │   ├── RecordingGate.jsx       # Record/Stop button, gate logic, ProcessingScreen
│   │   │   ├── ProcessingScreen.jsx    # Upload→Transcribe→Score→Done steps + timeout
│   │   │   ├── PassageDisplay.jsx      # Renders assigned passage text (min 18px)
│   │   │   └── CheckIndicator.jsx      # Reusable PASS/FAIL chip (color + icon + message)
│   │   ├── quality/
│   │   │   ├── QualityCheckPanel.jsx   # Renders all four check indicators + camera preview
│   │   │   ├── CameraPreview.jsx       # Live mirrored <video> element (pure stream consumer)
│   │   │   ├── PermissionExplainer.jsx # In-app camera/mic explanation shown BEFORE native prompt
│   │   │   └── PermissionDenied.jsx    # Device-specific recovery screen (switches on errorKind + platform)
│   │   ├── results/
│   │   │   ├── ScoreSummary.jsx        # WPM, word recognition %, reading level badge
│   │   │   ├── MiscueBreakdownList.jsx # 7 miscue type counts as bar list
│   │   │   └── BehavioralChecklist.jsx # 5 Phil-IRI behavioral flags with plain-language text
│   │   └── dashboard/
│   │       ├── ReadingLevelTrendChart.jsx  # Recharts step/line chart (Frustration/Instructional/Independent)
│   │       ├── WPMProgressionChart.jsx     # Recharts line chart + benchmark reference lines
│   │       ├── MiscueBreakdownChart.jsx    # Recharts bar or pie chart (aggregated across sessions)
│   │       └── BehavioralHistoryPanel.jsx  # 5 behavior rows with flagged count indicators
│   │
│   ├── hooks/
│   │   ├── useNoiseCheck.js        # Web Audio AnalyserNode — ambient noise, 500ms interval
│   │   ├── useLightingCheck.js     # Canvas API luminance, 500ms interval
│   │   ├── useCameraCheck.js       # MediaPipe Face Mesh WASM — face centered + angle
│   │   ├── useMicCheck.js          # Web Audio AnalyserNode — mic amplitude
│   │   ├── useQualityGate.js       # Aggregates 4 check hooks → { allPassed, checks }
│   │   ├── useMediaStream.js       # getUserMedia + permission state + stream lifecycle (ONLY track.stop caller)
│   │   ├── useMediaRecorder.js     # MediaRecorder + blob only — consumes useMediaStream, never stops tracks
│   │   ├── useAnalyzeSubmit.js     # fetch POST to FastAPI /analyze, timeout 120s, retry UI
│   │   ├── useSessionStorage.js    # Supabase INSERT sessions, retry x3 exponential backoff
│   │   ├── useSessionHistory.js    # Supabase SELECT sessions ORDER BY timestamp ASC
│   │   └── useAuth.js              # Supabase Auth state (session, user, signIn, signOut)
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # Provides auth state via useAuth; wraps entire app
│   │
│   ├── data/
│   │   └── passages.js             # Phil-IRI Grade 4 passage bank (id + text); random assignment logic
│   │
│   └── utils/
│       ├── readingLevel.js         # Maps reading_level string → plain-language label + explanation
│       └── platform.js             # Coarse iOS/Android/other UA detection — selects PermissionDenied recovery copy
│
├── .env.local                      # Gitignored. VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,
│                                   #   VITE_FASTAPI_URL, VITE_FASTAPI_API_KEY
├── index.html
├── vite.config.js                  # Vite config — @vitejs/plugin-react + @tailwindcss/vite (no vite-plugin-pwa);
│                                   #   preview.allowedHosts permits cloudflared/ngrok tunnels for mobile PWA testing
└── package.json                    # Tailwind v4 is zero-config — no tailwind.config.js or postcss.config.js
```

---

## Routing

Defined in `src/App.jsx` using `<BrowserRouter>` + `<Routes>` / `<Route>` (React Router). `BrowserRouter` is mounted in `src/main.jsx`. The `createBrowserRouter` data-router API is not used — the app has four flat routes with no loaders or deferred data, so the simpler component API is sufficient.

| Path | Component | Guard |
|---|---|---|
| `/login` | `LoginPage` | Redirect to `/session` if already authenticated |
| `/session` | `SessionScreen` | `AuthGuard` — redirect to `/login` if unauthenticated |
| `/results` | `SessionResultsPage` | `AuthGuard` — redirect to `/login`; redirect to `/session` if no result state |
| `/dashboard` | `DashboardPage` | `AuthGuard` — redirect to `/login` |
| `/` | Redirect → `/login` | — |

All non-critical pages (`SessionResultsPage`, `DashboardPage`) are **lazy loaded** with `React.lazy()` + `<Suspense>`. `LoginPage` and `SessionScreen` remain eagerly imported because they are on the critical recording path.

Navigation after submission: `RecordingGate` navigates to `/results` using `useNavigate`, passing `assessmentJSON` via React Router `state` (`navigate('/results', { state: { result } })`). `SessionResultsPage` reads it with `useLocation().state.result`.

### Planned (stubbed) routes

`LoginPage` renders two secondary actions that are **stubs** — the UI exists per the Figma design, but no route, page, or handler is wired up yet:

| Trigger (LoginPage) | Intended destination | Status |
|---|---|---|
| "Join ReadRight" (registration link) | `/register` → `RegisterPage` | Stub — button has no `onClick`/route. No sign-up flow exists. |
| "Forgot?" (password recovery) | `/forgot-password` → recovery flow | Stub — button has no `onClick`/route. No recovery flow exists. |

These are inert `type="button"` elements today. Wiring them up requires adding the route in `src/App.jsx`, the page under `src/pages/`, and the corresponding Supabase Auth call (`signUp` / `resetPasswordForEmail`) in a hook. Until then, do not present them as working flows.

---

## Global State Management

**No external state library.** State is managed at three levels:

1. **Auth state** — `AuthContext` (React Context + `useAuth` hook). Wraps the entire app. Provides `{ session, user, signIn, signOut, loading }`. All components access auth via `useAuth()`.

2. **Session/GO1 state** — Local to `SessionScreen` and its children. `useQualityGate` aggregates four check hooks. `useMediaStream` owns the stream + permission state machine; `useMediaRecorder` consumes that stream and manages the recorded blob. `useAnalyzeSubmit` manages the FastAPI POST state machine. These are not lifted above `SessionScreen`.

3. **Results state** — Passed via React Router navigation state from `SessionScreen` → `SessionResultsPage`. Not persisted in context. If the learner navigates directly to `/results` without state, redirect to `/session`.

4. **Dashboard data** — Fetched on mount by `useSessionHistory` inside `DashboardPage`. Not cached globally between navigations. Re-fetches on each mount.

---

## Data Fetching & API Integration Patterns

### Supabase (Auth + Database)

Initialised once in `src/lib/supabase.js`:
```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,    // stay signed in across reloads (localStorage, SDK-managed)
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
)
```

All hooks import `supabase` from this module. Never instantiate a second client. The session persists to `localStorage` (SDK default), so a reload keeps the learner authenticated — `AuthGuard` (below) relies on this.

**Auth:**
```js
// Sign in
const { data, error } = await supabase.auth.signInWithPassword({ email, password })
// Sign out
await supabase.auth.signOut()
// Listen for auth changes (in useAuth)
supabase.auth.onAuthStateChange((event, session) => { ... })
```

**INSERT session record (useSessionStorage):**
```js
const { error } = await supabase.from('sessions').insert([record])
// Retry up to 3 times with exponential backoff on error
// On final failure: return { saveStatus: 'failed', error: error.message }
// ResultsPage must still render even on failure — show save-failure banner
```

**SELECT session history (useSessionHistory):**
```js
const { data, error } = await supabase
  .from('sessions')
  .select('*')
  .eq('learner_id', user.id)
  .order('session_timestamp', { ascending: true })
```

This single fetch serves both UC-4.3 (Trend Charts) and UC-4.4 (Miscue + Behavioral panels). No duplicate query.

### FastAPI AI Microservice

Called exclusively in `useAnalyzeSubmit`:
```js
const formData = new FormData()
formData.append('file', mp4Blob, 'recording.mp4')
formData.append('passage_id', passageId)

const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 120_000)

const response = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/analyze`, {
  method: 'POST',
  headers: { 'X-API-Key': import.meta.env.VITE_FASTAPI_API_KEY },
  body: formData,
  signal: controller.signal,
})
clearTimeout(timeoutId)
```

- **Never** send the learner's JWT to FastAPI.
- On HTTP 500: display plain-language error, offer Re-record option.
- On `AbortError` (timeout at 120s): display timeout message, offer Retry or Re-record.

### AssessmentResultJSON Shape

The JSON returned by FastAPI and used by `ResultsPage`:
```ts
{
  wpm: number,
  word_recognition_pct: number,
  reading_level: 'Frustration' | 'Instructional' | 'Independent',
  correct: number,
  mispronunciation: number,
  substitution: number,
  omission: number,
  insertion: number,
  repetition: number,
  refusal_to_pronounce: number,
  finger_pointing: boolean,
  loss_of_place: boolean,
  monotone_reading: boolean,
  word_by_word_reading: boolean,
  inaudible_reading: boolean,
}
```

---

## Browser APIs — Usage Constraints

| API | Used in | Active during | Notes |
|---|---|---|---|
| `getUserMedia` | `useMediaStream` | GO1 + Recording | One combined audio+video stream; the only `getUserMedia` caller and the only place tracks are stopped |
| `MediaRecorder` | `useMediaRecorder` | Recording only | Consumes the `useMediaStream` stream; MIME: `video/mp4` (iOS), `video/webm;codecs=vp8,opus` (Android/Chrome) |
| `Web Audio API (AnalyserNode)` | `useNoiseCheck`, `useMicCheck` | GO1 only | Disconnect AnalyserNode on cleanup |
| `Canvas API` | `useLightingCheck` | GO1 only | Off-screen `<canvas>` element; sample every 500ms |
| `MediaPipe Face Mesh (WASM)` | `useCameraCheck` | GO1 camera check only | Not active during recording |

All browser API hooks must clean up all resources in their `useEffect` return.

### Media Stream & Permission Flow

`getUserMedia` ownership is split across two hooks so the live preview and GO1 checks keep running after a recording stops:

- **`useMediaStream`** is the *acquisition + permission + lifecycle* layer. It is the **only** hook that calls `getUserMedia` and the **only** hook that stops tracks. It returns `{ stream, audioTrack, videoTrack, permissionStatus, errorKind, requestStream, retry }`.
- **`useMediaRecorder`** and the four GO1 check hooks (`useCameraCheck` / `useMicCheck` / `useNoiseCheck` / `useLightingCheck`) are **consumers** of that stream. They must never call `getUserMedia` and never stop a track.

The native permission prompt only fires from `requestStream()`, which the UI triggers from `PermissionExplainer` after a learner tap — guaranteeing the plain-language explanation shows **before** the browser prompt.

`permissionStatus` drives which screen `SessionScreen` renders:

| `permissionStatus` | Meaning | Screen |
|---|---|---|
| `pending` | Explanation shown, awaiting the learner's tap | `PermissionExplainer` |
| `requesting` | `getUserMedia` in flight (native prompt open) | `PermissionExplainer` (button disabled) |
| `granted` | Stream active | Passage + `CameraPreview` + record/stop |
| `denied` | Acquisition failed | `PermissionDenied` (recovery steps) |

On failure, the raw `DOMException` never leaves `useMediaStream` — it is mapped to a stable, jargon-free `errorKind` that `PermissionDenied` switches on (with `platform` from `utils/platform.js` for the permission case):

| `errorKind` | Mapped from | Recovery copy |
|---|---|---|
| `permission` | `NotAllowedError`, `SecurityError` | Re-enable camera & mic (iOS Safari vs Android Chrome steps) |
| `notfound` | `NotFoundError`, `OverconstrainedError` | No camera on this device |
| `inuse` | `NotReadableError`, `TrackStartError`, `AbortError` | Camera busy / revoked mid-session |
| `insecure` | `mediaDevices` unavailable (non-HTTPS origin) | Open ReadRight over https |
| `unknown` | anything else | Generic "Try Again" |

---

## PWA Configuration

- Hand-rolled Service Worker at `public/sw.js`, registered in `src/main.jsx` after window `load`. No build-tool PWA plugin is used; `vite-plugin-pwa` is intentionally avoided because its default precaching behavior conflicts with the SRS requirement that there be **no offline caching**.
- Service Worker purpose: **home screen installation only**. The `fetch` handler is a passthrough to the network. No caches are populated. No background sync. No push notifications.
- `public/manifest.json` is referenced from `index.html` via `<link rel="manifest">`. It must include: `name`, `short_name`, `display: "standalone"`, `start_url`, `background_color`, `theme_color`, and at least two icon sizes (192px, 512px). Icon files live under `public/icons/` and are referenced with absolute paths (e.g. `/icons/icon-192.png`).
- PWA requires HTTPS at all times. `getUserMedia`, Service Worker registration, and JWT security all depend on a secure origin.

---

## Sessions Table Schema (Reference)

19 columns. Frontend reads all 19 for the dashboard. Frontend writes all 19 via `useSessionStorage`.

`session_id` (UUID PK) · `learner_id` (UUID FK) · `passage_id` (VARCHAR) · `session_timestamp` (TIMESTAMPTZ) · `wpm` (FLOAT) · `word_recognition_pct` (FLOAT) · `reading_level` (VARCHAR) · `correct` · `mispronunciation` · `substitution` · `omission` · `insertion` · `repetition` · `refusal_to_pronounce` (all INTEGER) · `finger_pointing` · `loss_of_place` · `monotone_reading` · `word_by_word_reading` · `inaudible_reading` (all BOOLEAN)

RLS: `SELECT` / `INSERT` only where `auth.uid() = learner_id`.