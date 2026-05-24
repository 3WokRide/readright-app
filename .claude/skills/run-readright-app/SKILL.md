---
name: run-readright-app
description: Build, run, screenshot, and drive the ReadRight web app. Use when asked to start ReadRight, run the dev server, take a screenshot of a page, drive the UI headlessly, run the build, or run lint.
---

ReadRight is a Vite + React 19 + React Router SPA (a Phil-IRI reading-assessment PWA). "Run it" headlessly means: start the Vite dev server, then drive a headless Chrome against it with `.claude/skills/run-readright-app/driver.mjs` — a stdin-command CDP driver (chromium-cli isn't installed here; this is the stand-in). Screenshots land in `/tmp/rr-shots/`.

All paths below are relative to the repo root (`readright-app/`).

## Prerequisites

Already present in this container — verify, don't reinstall:

```bash
node --version           # need 20+ ; this box has v24.14.0
google-chrome --version  # this box has 148.0.7778.178
```

The driver shells out to `google-chrome` headless and talks CDP over Node's built-in `WebSocket` — **no extra npm packages**, so the project's "don't add deps" rule stays intact. On a bare Ubuntu box without Chrome, install it first (`apt-get install -y ./google-chrome-stable_current_amd64.deb` pulls its own libs); not needed here.

## Setup

```bash
npm install
[ -f .env.local ] || cp .env.example .env.local   # guard: never clobber a filled-in .env.local
```

`.env.local` (gitignored) needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for login/auth and the dashboard to work. The **login screen itself renders without them**, so screenshots of `/login` and the routing/guard checks below work even with placeholders. `VITE_FASTAPI_URL` / `VITE_API_KEY` can stay blank (the analyze call is stubbed).

## Run (agent path)

Start the dev server in the background and poll the port (don't `sleep` — Vite serves in ~150ms but poll to be safe):

```bash
nohup npm run dev > /tmp/rr-dev.log 2>&1 &
echo $! > /tmp/rr-dev.pid
timeout 40 bash -c 'until curl -sf http://localhost:5173 >/dev/null; do sleep 1; done' && echo "SERVER UP"
```

Drive it — pipe commands to the driver, one per line. This is the verified smoke loop (login renders → React-safe form fill → protected route bounces to `/login` → no console errors):

```bash
node .claude/skills/run-readright-app/driver.mjs <<'EOF'
nav /login
wait-for Welcome Back
screenshot login
fill input[type=email] kid@example.com
fill input[type=password] hunter2
screenshot login-filled
nav /dashboard
sleep 1500
url
console-errors
quit
EOF
```

Screenshots → `/tmp/rr-shots/` (latest also symlinked as `/tmp/rr-shots/screenshot.png`). **Look at the PNG** — a green render isn't proof, the content is.

Stop the server when done:

```bash
kill "$(cat /tmp/rr-dev.pid)"   # or: pkill -f 'npm run dev'
```

### Driver commands

| command | what it does |
|---|---|
| `nav <url|/path>` | navigate (relative paths resolve against `BASE_URL`) |
| `wait-for <text>` | poll until visible text appears (15s timeout) |
| `wait-sel <css>` | poll until a CSS selector matches |
| `fill <css> <value>` | set an input **React-safely** (native setter + input/change events) |
| `click <css>` | `element.click()` |
| `screenshot [name]` | PNG to `/tmp/rr-shots/<name>.png` |
| `eval <js>` | evaluate JS in the page, print the JSON result |
| `text` / `url` | dump `document.body.innerText` (2KB) / `location.href` |
| `console-errors` | print collected console errors + uncaught exceptions |
| `sleep <ms>` / `quit` | wait / exit |

Env overrides: `BASE_URL` (default `http://localhost:5173`), `SHOT_DIR` (default `/tmp/rr-shots`), `CHROME_BIN` (default `google-chrome`).

### Reaching the authenticated screens (camera/mic, recording, results, dashboard)

Everything past `/login` is wrapped in `AuthGuard` and needs a real Supabase learner session — unauthenticated `nav /session` etc. redirect to `/login` (that redirect is what the smoke loop verifies). With valid creds: `fill` the email/password, `click button:has-text` is not supported (use a CSS selector), e.g. `click button[type=submit]` for "Start Reading", then `wait-for` the quality-check copy. The driver launches Chrome with `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream`, so the GO1 camera/mic checks get a synthetic camera + mic and auto-granted permission instead of hanging on a native prompt. **This post-login path is unverified here** (no learner credentials in this container) — the fake-media flags are wired in and Chrome accepts them, but confirm the flow once you have a test account.

## Run (human path)

```bash
npm run dev       # → http://localhost:5173 , Ctrl-C to stop
npm run preview   # → http://localhost:4173 , serves the built dist/ (run `npm run build` first)
```

A window doesn't open in this headless container — useful only with a browser on the machine.

## Build

```bash
npm run build     # vite build → dist/ ; ~2s, exit 0. Chunks: vendor / supabase / recharts / face_mesh split out.
```

## Test / Lint

No test runner is configured (`npm test` does not exist; Vitest/RTL not installed — see CLAUDE.md). Lint:

```bash
npm run lint
```

**Heads up:** lint currently **exits 1** with 2 pre-existing errors in `src/pages/QualityCheckScreen.jsx` (`react-hooks/refs` — `videoRef.current` read during render, lines 78–79). That's a known repo state, not something this skill introduced — don't treat a non-zero `npm run lint` as a fresh failure.

## Gotchas

- **React controlled inputs:** setting `el.value` directly won't fire React's `onChange`, so the field looks filled but state is empty. The driver's `fill` uses the native value setter + dispatches `input`/`change` — verified: `kid@example.com` shows in the email field after fill.
- **SPA routing is client-side:** `nav /dashboard` keeps the URL until React Router runs; the guard then rewrites it to `/login`. Use `url` (not the requested path) to see where you actually landed.
- **Piping `npm run lint | tail` hides the failure** — the pipe reports `tail`'s exit (0). Run it bare to see exit 1.
- **`EADDRINUSE` on relaunch:** a previous dev server is still bound to 5173. `pkill -f 'npm run dev'` before restarting.
- **Don't `click button:has-text(...)`** — that's Playwright/chromium-cli syntax. This driver's `click` takes a plain CSS selector (`querySelector`).

## Troubleshooting

- **`Chrome DevTools endpoint never came up`**: `google-chrome` not on PATH or crashed at launch. Check `google-chrome --version`; set `CHROME_BIN` if it's installed under another name.
- **`wait-for` times out on first nav**: Vite compiles routes on demand — the first hit can lag. The 15s poll usually covers it; re-run if a route was never visited before.
- **Blank/placeholder screenshot of an authed page**: you weren't logged in, so `AuthGuard` redirected to `/login`. Authenticate first (see above).
