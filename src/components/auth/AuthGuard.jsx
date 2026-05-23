import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../context/AuthContext'

/**
 * AuthGuard — gates a route on a signed-in Supabase session (RR-010).
 *
 * Wrap any protected page's element: <AuthGuard><DashboardPage /></AuthGuard>.
 * Unauthenticated learners are redirected to /login (replace, so the guarded
 * URL is not left in history).
 *
 * The session now persists (localStorage), but onAuthStateChange still resolves
 * asynchronously after a reload. We must wait for `loading` to settle before
 * deciding — otherwise a logged-in learner would be wrongly bounced to /login
 * during that brief initial resolution. While loading, render nothing.
 */
export function AuthGuard({ children }) {
  const { session, loading } = useAuthContext()

  if (loading) return null
  if (!session) return <Navigate to="/login" replace />

  return children
}
