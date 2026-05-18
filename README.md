# ReadRight

Phil-IRI oral reading assessment PWA for Grade 4 Filipino learners.

**Team Code:** 2526-sem2-cs342-11

---

## Getting started (< 10 minutes)

### Prerequisites
- Node.js 20+ (`node -v`)
- Git

### 1. Clone and install

```bash
git clone https://github.com/3WokRide/readright-app.git readright-app
cd readright-app
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the values shared by @infra-dev (from RR-001):

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-key>
VITE_FASTAPI_URL=      # leave blank until RR-005 is done
VITE_API_KEY=          # leave blank until RR-005 is done
```

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). You should see the LoginPage stub with no console errors.

---

## Project structure

```
src/
  components/    Shared UI components
  pages/         LoginPage, SessionScreen, SessionResultsPage, DashboardPage
  hooks/         GO1 quality check hooks + useSessionHistory
  lib/
    supabase.js  Supabase client (memory-only JWT per SRS NFR-S3)
    api.js       FastAPI /analyze client (STUBBED in RR-003)
  data/
    passages.js  Phil-IRI Grade 4 passage bank (≥4 passages)
public/
  manifest.json  PWA manifest
src/
  sw.js          Service Worker (install-only, no caching per SRS)
```

## Routes

| Path | Page | Status |
|---|---|---|
| `/login` | LoginPage | Stub |
| `/session` | SessionScreen | Stub |
| `/results` | SessionResultsPage | Stub |
| `/dashboard` | DashboardPage | Stub |

## Key constraints (read before implementing)

- **No offline mode** — Service Worker is for PWA installation only
- **No localStorage for JWTs** — `persistSession: false` in supabase.js must not be changed (SRS NFR-S3)
- **api.js is stubbed** — do not call the real FastAPI until RR-005 is deployed
- **Grade 4 only** — do not add other grade levels to passages.js
