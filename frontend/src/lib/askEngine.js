/**
 * Deterministic client-side keyword search over the JSON data.
 * Given a natural-language question, returns the best-matching feature
 * (or null if no meaningful match). Never generates text.
 */

const STOP_WORDS = new Set([
  "a","an","the","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","of","in","on","at","for","to","from","by","with","as",
  "and","or","but","if","then","so","not","no","this","that","these","those",
  "i","we","you","they","he","she","it","my","our","your","their","its",
  "about","any","can","could","should","would","will","just","only","some",
  "what","how","when","where","who","which","why","cover","covers","policy",
  "policies","insurance","insurer","insurers","plan","plans",
]);

const CANONICAL = {
  "chemo": "chemotherapy",
  "radio": "radiotherapy",
  "mri": "diagnostic imaging",
  "ct": "diagnostic imaging",
  "pet": "diagnostic imaging",
  "scans": "diagnostic imaging",
  "test": "tests",
  "kids": "children",
  "child": "children",
  "baby": "children",
  "newborn": "children",
  "birth": "congenital",
  "adhd": "mental health",
  "counsellor": "mental health",
  "counselling": "mental health",
  "therapy": "mental health",
  "therapist": "mental health",
  "psych": "mental health",
  "psychologist": "mental health",
  "psychiatrist": "mental health",
  "psychiatric": "mental health",
  "depression": "mental health",
  "anxiety": "mental health",
  "pregnancy": "obstetrics",
  "pregnant": "obstetrics",
  "maternity": "obstetrics",
  "baby": "obstetrics",
  "labour": "obstetrics",
  "delivery": "obstetrics",
  "gp": "day-to-day",
  "dentist": "day-to-day",
  "dental": "day-to-day",
  "optical": "day-to-day",
  "glasses": "day-to-day",
  "physio": "day-to-day",
  "physiotherapy": "day-to-day",
  "prescription": "day-to-day",
  "prescriptions": "day-to-day",
  "pharmac": "non-pharmac",
  "expensive": "non-pharmac",
  "unfunded": "non-pharmac",
  "drug": "medicines",
  "drugs": "medicines",
  "medicine": "medicines",
  "medication": "medicines",
  "prior": "prior approval",
  "approval": "prior approval",
  "preauth": "prior approval",
  "pre-existing": "pre-existing",
  "existing": "pre-existing",
  "waiting": "stand-down",
  "wait": "stand-down",
  "waits": "stand-down",
  "standdown": "stand-down",
  "surgery": "surgical",
  "surgical": "surgical",
  "operate": "surgical",
  "operation": "surgical",
  "hospital": "hospital",
  "specialist": "specialist",
  "referral": "specialist",
  "loyalty": "loyalty",
  "excess": "excess",
  "deductible": "excess",
  "provider": "approved-provider",
  "network": "approved-provider",
  "affiliated": "approved-provider",
  "claim": "claims",
  "claims": "claims",
  "exclusion": "exclusions",
  "exclusions": "exclusions",
  "cancer": "cancer",
  "oncology": "cancer",
  "tumour": "cancer",
  "tumor": "cancer",
};

function tokenize(text) {
  if (!text) return [];
  return String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOP_WORDS.has(t))
    .flatMap((t) => (CANONICAL[t] || t).split(/\s+/))
    .filter(Boolean)
    .filter((t) => !STOP_WORDS.has(t));
}

function scoreFeature(feature, data, glossary, questionTokens) {
  // Build the corpus for this feature: name + definition + why + short + detail across insurers
  const parts = [feature.feature, feature.definition, feature.why || ""];
  Object.values(data || {}).forEach((rows) => {
    rows.forEach((row) => {
      if (row.feature === feature.feature) {
        if (row.short) parts.push(row.short);
        if (row.detail) parts.push(row.detail);
        if (Array.isArray(row.detail_points)) parts.push(...row.detail_points);
      }
    });
  });
  // Include glossary term matches: any glossary term that shows up in the feature text
  const featureCorpus = parts.join(" ").toLowerCase();
  Object.keys(glossary || {}).forEach((term) => {
    if (featureCorpus.includes(term.toLowerCase())) parts.push(term);
  });

  const corpusTokens = new Set(tokenize(parts.join(" ")));

  let score = 0;
  const nameTokens = new Set(tokenize(feature.feature));
  const groupTokens = new Set(tokenize(feature.group || ""));
  questionTokens.forEach((qt) => {
    if (nameTokens.has(qt)) score += 3;
    else if (groupTokens.has(qt)) score += 2;
    else if (corpusTokens.has(qt)) score += 1;
  });
  return score;
}

/**
 * Match a question against features. Returns:
 *   { feature: <feature>, score: N, tokens: [...] } | null
 */
export function matchQuestion(question, { features, data, glossary }) {
  const tokens = tokenize(question);
  if (tokens.length === 0) return null;
  let best = null;
  features.forEach((f) => {
    const s = scoreFeature(f, data, glossary, tokens);
    if (s > 0 && (!best || s > best.score)) {
      best = { feature: f, score: s, tokens };
    }
  });
  // Require a minimum signal so nonsense queries fall through to the adviser CTA
  if (!best || best.score < 2) return null;
  return best;
}
