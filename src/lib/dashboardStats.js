/**
 * dashboardStats — pure aggregation helpers for the Progress Dashboard (RR-049).
 * Kept out of the chart components so they stay unit-testable without rendering
 * Recharts (which doesn't lay out under jsdom).
 */
import { miscueKeys } from './philIri'

// Plural labels read better for cumulative totals ("Substitutions: 9").
export const MISCUE_LABELS = {
  mispronunciation: 'Mispronunciations',
  substitution: 'Substitutions',
  omission: 'Omissions',
  insertion: 'Insertions',
  repetition: 'Repetitions',
  refusal_to_pronounce: 'Refusals',
}

/** Sum each miscue type across all sessions, drop zeros, sort most-frequent first. */
export function miscueTotals(sessions) {
  return miscueKeys
    .map((key) => ({
      name: MISCUE_LABELS[key],
      total: sessions.reduce((sum, s) => sum + (s[key] ?? 0), 0),
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total)
}
