/**
 * api.js — FastAPI /analyze endpoint client (REA-28 · RR-043).
 *
 * Posts the recorded reading (webm on Chrome, mp4 on Safari — the Blob is sent
 * as-is, so both work) plus the passage_id to the deployed FastAPI service and
 * returns the AssessmentResultJSON.
 *
 * Security (CLAUDE.md): only the media file + passage_id are sent — never the
 * learner's Supabase JWT. The static X-API-Key (VITE_API_KEY) authenticates the
 * call. Do not set Content-Type manually: fetch adds the multipart boundary for
 * FormData automatically.
 *
 * Config: VITE_FASTAPI_URL must be the deployed HTTPS base URL (not localhost).
 * Timeout / retry UX is out of scope here — handled by RR-050 (REA-34).
 */

/** Error that carries the FastAPI failure `code` (e.g. 'DB_WRITE_FAILED') for callers. */
export class ApiError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

/**
 * @param {File|Blob} file      — recording from MediaRecorder (webm or mp4)
 * @param {string}    passageId — e.g. 'phil-iri-g4-p1'
 * @returns {Promise<AssessmentResultJSON>}
 * @throws {ApiError} on a non-2xx response
 */
export async function submitRecording(file, passageId) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('passage_id', passageId)

  const response = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/analyze`, {
    method: 'POST',
    headers: { 'X-API-Key': import.meta.env.VITE_API_KEY },
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new ApiError(err.code || 'UNKNOWN_ERROR', err.error || 'Analysis failed')
  }

  return response.json()
}
