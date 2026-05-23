/**
<<<<<<< Updated upstream
 * api.js — FastAPI /analyze endpoint client
=======
 * api.js — FastAPI /analyze endpoint client (REA-28 · RR-043, REA-34 · RR-050).
>>>>>>> Stashed changes
 *
 * RR-003: submitRecording() is STUBBED with a setTimeout that returns
 * hardcoded AssessmentResultJSON matching the 19-field sessions schema.
 * Replace the stub body with the real fetch() call when the FastAPI
 * microservice is deployed (RR-005 / RR-006).
 *
 * Real implementation shape (for reference):
 *
<<<<<<< Updated upstream
 *   const form = new FormData()
 *   form.append('file', mp4File)
 *   form.append('passage_id', passageId)
 *   const res = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/analyze`, {
 *     method: 'POST',
 *     headers: { 'X-API-Key': import.meta.env.VITE_API_KEY },
 *     body: form,
 *     signal: AbortSignal.timeout(120_000), // 120s max per SRS
 *   })
 *   if (!res.ok) throw new Error(`FastAPI error: ${res.status}`)
 *   return res.json()
 */

=======
 * Config: VITE_FASTAPI_URL must be the deployed HTTPS base URL (not localhost).
 * Timeout (RR-050): the request is aborted after 120s and surfaced as a distinct
 * ApiError with code 'TIMEOUT', so the UI can show a timeout-specific message
 * separate from a general failure.
 */

const TIMEOUT_MS = 120_000 // 120 seconds — master-brief limit (RR-050)

/** Error that carries the FastAPI failure `code` (e.g. 'TIMEOUT', 'DB_WRITE_FAILED'). */
export class ApiError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

>>>>>>> Stashed changes
/**
 * @param {File} mp4File   — MP4 recording from MediaRecorder
 * @param {string} passageId — e.g. 'phil-iri-g4-p1'
 * @returns {Promise<AssessmentResultJSON>}
<<<<<<< Updated upstream
=======
 * @throws {ApiError} on a non-2xx response, or code 'TIMEOUT' after 120s
>>>>>>> Stashed changes
 */
export async function submitRecording(mp4File, passageId) {
  console.info('[api] submitRecording() STUB — returning hardcoded result in 3s')
  console.info('[api] file:', mp4File?.name ?? '(none)', '| passageId:', passageId)

<<<<<<< Updated upstream
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Hardcoded result matching the 19-column sessions schema (GO2 + GO3 fields).
  // session_id, learner_id, and session_timestamp are added by the DB/frontend.
  return {
    // GO2 — scoring
    passage_id:          passageId,
    wpm:                 72.5,
    word_recognition_pct: 88.0,
    reading_level:       'Instructional', // 'Frustration' | 'Instructional' | 'Independent'

    // GO2 — miscue counts (7 types)
    correct:             88,
    mispronunciation:    4,
    substitution:        3,
    omission:            2,
    insertion:           1,
    repetition:          2,
    refusal_to_pronounce: 0,

    // GO3 — behavioral flags (5 Phil-IRI qualitative behaviors)
    finger_pointing:     false,
    loss_of_place:       false,
    monotone_reading:    true,
    word_by_word_reading: false,
    inaudible_reading:   false,
=======
  // Abort the request ourselves if the pipeline exceeds the 120s budget — a
  // pending-too-long request is a distinct failure mode from a 4xx/5xx error.
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/analyze`, {
      method: 'POST',
      headers: { 'X-API-Key': import.meta.env.VITE_API_KEY },
      body: formData,
      signal: controller.signal,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new ApiError(err.code || 'UNKNOWN_ERROR', err.error || 'Analysis failed')
    }
    return await response.json()
  } catch (err) {
    // An abort surfaces as AbortError — rethrow as a distinct TIMEOUT so the UI
    // can tell "took too long" apart from "server returned an error".
    if (err.name === 'AbortError') {
      throw new ApiError('TIMEOUT', 'timeout')
    }
    throw err
  } finally {
    // Always clear — no timeout leak on success, error, or abort.
    clearTimeout(timeoutId)
>>>>>>> Stashed changes
  }
}
