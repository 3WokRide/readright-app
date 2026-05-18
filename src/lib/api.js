/**
 * api.js — FastAPI /analyze endpoint client
 *
 * RR-003: submitRecording() is STUBBED with a setTimeout that returns
 * hardcoded AssessmentResultJSON matching the 19-field sessions schema.
 * Replace the stub body with the real fetch() call when the FastAPI
 * microservice is deployed (RR-005 / RR-006).
 *
 * Real implementation shape (for reference):
 *
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

/**
 * @param {File} mp4File   — MP4 recording from MediaRecorder
 * @param {string} passageId — e.g. 'phil-iri-g4-p1'
 * @returns {Promise<AssessmentResultJSON>}
 */
export async function submitRecording(mp4File, passageId) {
  console.info('[api] submitRecording() STUB — returning hardcoded result in 3s')
  console.info('[api] file:', mp4File?.name ?? '(none)', '| passageId:', passageId)

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
  }
}
