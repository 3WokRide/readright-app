import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { supabase } from './lib/supabase.js'
import './index.css'

// Dev-only logout escape hatch (no UI for it yet). Type `readright.logout()`
// in the browser devtools console to clear the persisted Supabase session;
// onAuthStateChange then fires, AuthContext drops the session, and AuthGuard
// bounces you to /login. Guarded by import.meta.env.DEV so it never ships.
if (import.meta.env.DEV) {
  window.readright = {
    logout: () => supabase.auth.signOut(),
  }
  console.info('[ReadRight] Dev helper ready — run readright.logout() to sign out.')
}

// Service Worker registration — PWA installation support only (SRS §2.1).
// Production-only so it never interferes with the Vite dev server / HMR.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.info('[SW] Registered:', reg.scope))
      .catch((err) => console.warn('[SW] Registration failed:', err))
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
