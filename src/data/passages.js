/**
 * passages.js — Phil-IRI Grade 4 passage bank
 *
 * Scope: Grade 4 only (SRS §1.2 — other grades are explicitly out of scope).
 * Passages are randomly assigned per session; the learner never selects.
 * Word counts are calibrated for ~1–3 minute oral readings at Grade 4 pace.
 *
 * ⚠️  Replace placeholder text below with the official DepEd Phil-IRI
 * Grade 4 standard passages before pilot deployment. Passage content must
 * match the exact DepEd source to ensure scoring validity (SRS §2.4).
 * The structure (id, title, text, wordCount) must remain unchanged.
 */

export const passages = [
  {
    id: 'phil-iri-g4-p1',
    title: 'The Helpful Neighbor',
    // ~100 words — representative Grade 4 reading level
    text:
      'Maria lived in a small village near the mountains. Every morning, she woke up early to help her mother prepare breakfast. After eating, she walked to school with her friends along the dirt road that passed by the rice fields. One afternoon, she noticed that her neighbor Lola Caring had dropped her basket of vegetables. Without hesitation, Maria ran to help gather the scattered camotes and kangkong. Lola Caring smiled and thanked her warmly. That evening, Maria told her mother what had happened. Her mother hugged her and said that being kind to others is one of the most important things a person can do.',
    wordCount: 104,
  },
  {
    id: 'phil-iri-g4-p2',
    title: 'The Carabao and the Farmer',
    text:
      'Mang Jose had a carabao named Kardo who helped him plow the fields every day. Kardo was strong and patient, never complaining even under the hot afternoon sun. One dry season, the river behind their farm almost disappeared and the soil became very hard. Mang Jose worried that they would not be able to plant rice in time. But Kardo pulled the plow with great effort, breaking through the cracked earth row by row. When the rains finally came, Mang Jose planted his seedlings in the freshly turned soil. He patted Kardo on the neck and said, "Without you, none of this would be possible." Kardo lifted his head and let out a low, gentle sound.',
    wordCount: 116,
  },
  {
    id: 'phil-iri-g4-p3',
    title: 'A Visit to the Palengke',
    text:
      'Every Saturday morning, Aling Rosa brought her children to the public market to buy fresh food for the week. The palengke was full of color and noise. Vendors called out their prices while shoppers moved carefully between the crowded stalls. Rosa\'s daughter Ate Bianca helped carry the bayong while her younger brother Dino pointed excitedly at the bright bangus and galunggong laid out on beds of ice. They stopped at their favorite vegetable stall where Manong Ernie always gave them a little extra for free. After an hour, their bayong was heavy with eggplant, tomatoes, garlic, and dried fish. On the way home, Dino asked if they could cook sinigang for lunch. His mother laughed and said she had already planned exactly that.',
    wordCount: 124,
  },
  {
    id: 'phil-iri-g4-p4',
    title: 'The Lost Puppy',
    text:
      'On the way home from school, Carlo found a small brown puppy sitting alone beside the road. It had no collar and looked hungry and afraid. Carlo knelt down slowly so he would not startle it and held out his hand. The puppy sniffed carefully, then licked his fingers. Carlo picked it up gently and carried it home inside his bag. His mother was surprised when she saw the tiny dog. They gave it water and a small piece of leftover rice. Carlo named him Bantay. For the next three days, Carlo made a sign and posted it around the neighborhood to find the puppy\'s owner. On the fourth day, a little girl knocked on their door with tears in her eyes. Carlo felt sad to let Bantay go, but he was glad to see the girl\'s face light up with joy.',
    wordCount: 141,
  },
]

/**
 * Returns a randomly selected passage from the bank.
 * Called once per session on the SessionScreen mount.
 * @returns {{ id: string, title: string, text: string, wordCount: number }}
 */
export function getRandomPassage() {
  const index = Math.floor(Math.random() * passages.length)
  return passages[index]
}
