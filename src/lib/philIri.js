/**
 * philIri.js — shared Phil-IRI domain constants and helpers.
 *
 * Single source of truth for reading-level, miscue, and behavioral-flag
 * config used by both the dashboard and the results page. Keep in sync with
 * the AssessmentResultJSON contract in api.js and the `sessions` table schema.
 */

// Reading level ↔ numeric (for charting the trend line)
export const levelToNum = { Frustration: 1, Instructional: 2, Independent: 3 }
export const numToLevel = { 1: 'Frustration', 2: 'Instructional', 3: 'Independent' }

// Results-page reading level badge + child-friendly explanation
export const levelConfig = {
  Independent: {
    bg: 'var(--color-goal)',
    label: 'INDEPENDENT',
    explanation: 'You read this passage mostly on your own. Great job!',
  },
  Instructional: {
    bg: 'var(--color-goal)',
    label: 'INSTRUCTIONAL',
    explanation: 'This means you read most of the passage well! Keep practicing to reach Independent level.',
  },
  Frustration: {
    bg: 'var(--color-brand)',
    label: 'FRUSTRATION',
    explanation: "This passage was very challenging. Keep practising — you'll get there!",
  },
}

// GO2 miscue counts
export const miscueKeys = [
  'mispronunciation', 'substitution', 'omission',
  'insertion', 'repetition', 'refusal_to_pronounce',
]

export const miscueLabels = {
  mispronunciation:     'Mispronunciation',
  substitution:         'Substitution',
  omission:             'Omission',
  insertion:            'Insertion',
  repetition:           'Repetition',
  refusal_to_pronounce: 'Refusal to Pronounce',
}

// GO3 behavioral flags (display order + labels for the Reading Habits section)
export const behaviorRows = [
  { key: 'finger_pointing',      label: 'Finger Pointing', desc: 'Helps maintain place in text' },
  { key: 'loss_of_place',        label: 'Loss of Place',   desc: 'Try using a steady reading pace' },
  { key: 'monotone_reading',     label: 'Prosody',         desc: 'Expression and phrasing' },
  { key: 'word_by_word_reading', label: 'Word by Word',    desc: 'Try reading phrases together' },
  { key: 'inaudible_reading',    label: 'Amplitude',       desc: 'Volume consistency' },
]

// Phil-IRI word-recognition range → label + token color
export const wrRange = (pct) =>
  pct >= 97 ? { label: 'Independent: Above 97%', color: 'var(--color-goal)' }
  : pct >= 91 ? { label: 'Instructional: 91–96%', color: 'var(--color-goal)' }
  : { label: 'Frustration: Below 91%', color: 'var(--color-brand)' }
