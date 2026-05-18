/**
 * sw.js — ReadRight Service Worker
 *
 * Scope per SRS §2.1 and SDD §2.1:
 *   The Service Worker is used EXCLUSIVELY for PWA home screen installation.
 *   It does NOT provide offline caching, background sync, or push notifications.
 *   An active network connection is required for all app functionality.
 *
 * This file must be served from the root path (/sw.js) for the browser to grant
 * it the correct scope. Vite handles this automatically when the file is in /public
 * or registered via the build config.
 *
 * Registration happens in src/main.jsx after the app mounts.
 */

const CACHE_NAME = 'readright-install-v1'

// install — no assets cached (offline not supported)
self.addEventListener('install', (event) => {
  console.info('[SW] Installing — installation support only, no caching.')
  self.skipWaiting()
})

// activate — immediately claim all clients
self.addEventListener('activate', (event) => {
  console.info('[SW] Activated.')
  event.waitUntil(self.clients.claim())
})

// fetch — pass all requests straight through to the network
// Do NOT add any caching logic here per SRS scope constraints.
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
