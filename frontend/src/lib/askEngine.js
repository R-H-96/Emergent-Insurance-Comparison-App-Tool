/**
 * Deterministic client-side ask engine (v2 — synonyms + typo tolerance).
 *
 * Ranking signals per feature:
 *   +5 exact phrase match of any synonym phrase in the question
 *   +3 token in feature name
 *   +2 token in group name
 *   +1 token in feature corpus (definition, why, cells, glossary mentions)
 *
 * All tokenisation is case-insensitive. Words of ≥5 letters use Levenshtein
 * distance ≤2 for fuzzy match ("surgey" → "surgery"). Never generates text —
 * only returns the best feature match (or null when below the threshold).
 */

const STOP_WORDS = new Set([
  "a","an","the","is","are","was","were","be","been","being","have","has","had",
  "do","does","did","of","in","on","at","for","to","from","by","with","as",
  "and","or","but","if","then","so","not","no","this","that","these","those",
  "i","we","you","they","he","she","it","my","our","your","their","its",
  "about","any","can","could","should","would","will","just","only","some",
  "what","how","when","where","who","which","why","cover","covers","policy",
  "policies","insurance","insurer","insurers","plan","plans","get","really",
]);

function normalise(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalise(text)
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOP_WORDS.has(t));
}

// Damerau-lite Levenshtein (transpositions ignored). Good enough for typos.
function editDistance(a, b) {
  if (a === b) return 0;
  const al = a.length;
  const bl = b.length;
  if (Math.abs(al - bl) > 2) return 3; // early exit for our ≤2 threshold
  const prev = new Array(bl + 1);
  const curr = new Array(bl + 1);
  for (let j = 0; j <= bl; j++) prev[j] = j;
  for (let i = 1; i <= al; i++) {
    curr[0] = i;
    for (let j = 1; j <= bl; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost,
      );
    }
    for (let j = 0; j <= bl; j++) prev[j] = curr[j];
  }
  return prev[bl];
}

// Return true if `qToken` matches any token in the corpus set — either exact
// or (for tokens of length >= 5) within edit-distance 2.
function fuzzyHas(corpusSet, qToken) {
  if (corpusSet.has(qToken)) return true;
  if (qToken.length < 5) return false;
  for (const t of corpusSet) {
    if (t.length < 4) continue;
    if (Math.abs(t.length - qToken.length) > 2) continue;
    if (editDistance(t, qToken) <= 2) return true;
  }
  return false;
}

function buildFeatureCorpus(feature, data, glossary) {
  const parts = [
    feature.feature,
    feature.definition || "",
    feature.why || "",
    feature.group || "",
  ];
  Object.values(data || {}).forEach((rows) => {
    rows.forEach((row) => {
      if (row.feature === feature.feature) {
        if (row.short) parts.push(row.short);
        if (row.detail) parts.push(row.detail);
        if (Array.isArray(row.detail_points)) parts.push(...row.detail_points);
      }
    });
  });
  const joined = parts.join(" ").toLowerCase();
  Object.keys(glossary || {}).forEach((term) => {
    if (joined.includes(term.toLowerCase())) parts.push(term);
  });
  return parts.join(" ");
}

function scoreFeature(feature, opts) {
  const { data, glossary, synonyms, questionNormalised, questionTokens } = opts;
  let score = 0;

  // Synonym phrase match (highest weight)
  const phrases = (synonyms && synonyms[feature.feature]) || [];
  for (const phrase of phrases) {
    const p = normalise(phrase);
    if (!p) continue;
    if (questionNormalised.includes(p)) {
      score += 5;
      break; // one hit is enough for this feature
    }
  }

  const name = new Set(tokenize(feature.feature));
  const group = new Set(tokenize(feature.group || ""));
  const corpus = new Set(tokenize(buildFeatureCorpus(feature, data, glossary)));

  for (const qt of questionTokens) {
    if (fuzzyHas(name, qt)) score += 3;
    else if (fuzzyHas(group, qt)) score += 2;
    else if (fuzzyHas(corpus, qt)) score += 1;
  }
  return score;
}

export function matchQuestion(question, { features, data, glossary, synonyms }) {
  const qNorm = normalise(question);
  const qTokens = tokenize(question);
  if (qTokens.length === 0 && !qNorm) return null;

  let best = null;
  for (const f of features) {
    const s = scoreFeature(f, {
      data,
      glossary,
      synonyms,
      questionNormalised: qNorm,
      questionTokens: qTokens,
    });
    if (s > 0 && (!best || s > best.score)) {
      best = { feature: f, score: s, tokens: qTokens };
    }
  }
  if (!best || best.score < 2) return null;
  return best;
}
