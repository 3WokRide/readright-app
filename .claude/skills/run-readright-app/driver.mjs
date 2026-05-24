#!/usr/bin/env node
// Headless-Chrome driver for the ReadRight web app (CDP over Node's built-in
// WebSocket — no npm deps, so it never touches the project's package.json).
//
// chromium-cli isn't installed in this container, so this is the stand-in.
// It launches google-chrome headless, connects via the Chrome DevTools
// Protocol, and reads one command per line from stdin — same loop as
// chromium-cli: nav -> wait-for -> act -> screenshot -> console-errors.
//
// Usage:
//   node driver.mjs <<'EOF'
//   nav http://localhost:5173/login
//   wait-for Welcome Back
//   screenshot login
//   fill input[type=email] kid@example.com
//   fill input[type=password] hunter2
//   screenshot login-filled
//   console-errors
//   EOF
//
// Env:
//   BASE_URL   default http://localhost:5173
//   SHOT_DIR   default /tmp/rr-shots
//   CHROME_BIN default google-chrome
//   HEADFUL=1  launch with a visible window (needs a display / xvfb)
//
// Chrome is launched with --use-fake-ui-for-media-stream and
// --use-fake-device-for-media-stream so the GO1 camera/mic checks get a
// synthetic green-pattern camera + beeping mic and auto-grant permission —
// the quality-check screen runs headless instead of hanging on a prompt.

import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync, symlinkSync, rmSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { setTimeout as sleep } from 'node:timers/promises'
import readline from 'node:readline'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const SHOT_DIR = process.env.SHOT_DIR || '/tmp/rr-shots'
const CHROME_BIN = process.env.CHROME_BIN || 'google-chrome'
const PORT = 9222 + Math.floor(Math.random() * 1000)
const USER_DIR = `/tmp/rr-chrome-${process.pid}`

mkdirSync(SHOT_DIR, { recursive: true })

const chromeArgs = [
  process.env.HEADFUL ? '--headless=off' : '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--hide-scrollbars',
  '--disable-dev-shm-usage',
  '--use-fake-ui-for-media-stream',
  '--use-fake-device-for-media-stream',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${USER_DIR}`,
  '--window-size=412,915',
  'about:blank',
].filter((a) => a !== '--headless=off')

const chrome = spawn(CHROME_BIN, chromeArgs, { stdio: ['ignore', 'ignore', 'ignore'] })

function cleanup() {
  try { chrome.kill('SIGKILL') } catch {}
  try { rmSync(USER_DIR, { recursive: true, force: true }) } catch {}
}
process.on('exit', cleanup)
process.on('SIGINT', () => { cleanup(); process.exit(130) })

// --- find the page target's websocket URL --------------------------------
async function discover() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`)
      const targets = await res.json()
      const page = targets.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
      if (page) return page.webSocketDebuggerUrl
    } catch {}
    await sleep(100)
  }
  throw new Error('Chrome DevTools endpoint never came up')
}

// --- minimal CDP client ---------------------------------------------------
let ws, nextId = 1
const pending = new Map()
const consoleErrors = []
const pageErrors = []

function send(method, params = {}) {
  const id = nextId++
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

async function connect(url) {
  ws = new WebSocket(url)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
    } else if (msg.method === 'Runtime.consoleAPICalled') {
      if (msg.params.type === 'error') {
        consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description ?? '').join(' '))
      }
    } else if (msg.method === 'Runtime.exceptionThrown') {
      pageErrors.push(msg.params.exceptionDetails.exception?.description
        || msg.params.exceptionDetails.text)
    }
  }
  await send('Page.enable')
  await send('Runtime.enable')
}

// --- helpers --------------------------------------------------------------
async function evaluate(expression) {
  const r = await send('Runtime.evaluate', {
    expression, returnByValue: true, awaitPromise: true,
  })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text)
  return r.result.value
}

function resolveUrl(u) {
  if (/^https?:\/\//.test(u)) return u
  return BASE_URL.replace(/\/$/, '') + (u.startsWith('/') ? u : '/' + u)
}

async function waitForText(text, timeoutMs = 15000) {
  const t0 = Date.now()
  const esc = JSON.stringify(text)
  while (Date.now() - t0 < timeoutMs) {
    const ok = await evaluate(`document.body && document.body.innerText.includes(${esc})`)
    if (ok) return true
    await sleep(200)
  }
  throw new Error(`timed out waiting for text: ${text}`)
}

async function waitForSel(sel, timeoutMs = 15000) {
  const t0 = Date.now()
  const esc = JSON.stringify(sel)
  while (Date.now() - t0 < timeoutMs) {
    const ok = await evaluate(`!!document.querySelector(${esc})`)
    if (ok) return true
    await sleep(200)
  }
  throw new Error(`timed out waiting for selector: ${sel}`)
}

async function screenshot(name = `shot-${Date.now()}`) {
  const r = await send('Page.captureScreenshot', { format: 'png' })
  const file = join(SHOT_DIR, name.endsWith('.png') ? name : `${name}.png`)
  writeFileSync(file, Buffer.from(r.data, 'base64'))
  const latest = join(SHOT_DIR, 'screenshot.png')
  try { rmSync(latest, { force: true }); symlinkSync(file, latest) } catch {}
  return file
}

// React-safe value set: uses the native setter so React's onChange fires.
async function fill(sel, value) {
  const escSel = JSON.stringify(sel)
  const escVal = JSON.stringify(value)
  const ok = await evaluate(`(() => {
    const el = document.querySelector(${escSel});
    if (!el) return false;
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement : HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(proto.prototype, 'value').set;
    setter.call(el, ${escVal});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`)
  if (!ok) throw new Error(`fill: selector not found: ${sel}`)
}

async function click(sel) {
  const escSel = JSON.stringify(sel)
  const ok = await evaluate(`(() => {
    const el = document.querySelector(${escSel});
    if (!el) return false; el.click(); return true;
  })()`)
  if (!ok) throw new Error(`click: selector not found: ${sel}`)
}

// --- command dispatch -----------------------------------------------------
async function run(line) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const [cmd, ...rest] = trimmed.split(/\s+/)
  const arg = trimmed.slice(cmd.length).trim()
  switch (cmd) {
    case 'nav': {
      const url = resolveUrl(arg)
      await send('Page.navigate', { url })
      await sleep(400)
      console.log(`navigated -> ${url}`)
      break
    }
    case 'wait-for':   await waitForText(arg); console.log(`found text: ${arg}`); break
    case 'wait-sel':   await waitForSel(arg);  console.log(`found selector: ${arg}`); break
    case 'screenshot': { const f = await screenshot(arg || undefined); console.log(`screenshot -> ${f}`); break }
    case 'fill': {
      const m = arg.match(/^(\S+)\s+(.*)$/)
      if (!m) throw new Error('usage: fill <selector> <value>')
      await fill(m[1], m[2]); console.log(`filled ${m[1]}`); break
    }
    case 'click':      await click(arg); console.log(`clicked ${arg}`); break
    case 'eval':       console.log(JSON.stringify(await evaluate(arg))); break
    case 'url':        console.log(await evaluate('location.href')); break
    case 'text':       console.log((await evaluate('document.body.innerText')).slice(0, 2000)); break
    case 'console-errors':
      console.log(consoleErrors.length || pageErrors.length
        ? JSON.stringify({ console: consoleErrors, exceptions: pageErrors }, null, 2)
        : 'no console errors or exceptions')
      break
    case 'sleep':      await sleep(Number(arg) || 1000); break
    case 'quit': case 'exit': process.exit(0); break
    default: console.log(`unknown command: ${cmd}`)
  }
}

// --- main -----------------------------------------------------------------
const wsUrl = await discover()
await connect(wsUrl)
console.log(`driver ready (chrome on :${PORT}, base ${BASE_URL}, shots ${SHOT_DIR})`)

const rl = readline.createInterface({ input: process.stdin })
for await (const line of rl) {
  try { await run(line) } catch (e) { console.log(`ERROR: ${e.message}`) }
}
process.exit(0)
