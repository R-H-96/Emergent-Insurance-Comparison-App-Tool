/**
 * At-a-glance model — the single source of truth for the redesigned
 * At-a-glance surface (radar hero → care journey → differences reel).
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  COMPLIANCE NOTE — READ BEFORE LAUNCH
 * ─────────────────────────────────────────────────────────────────────────
 *  The `THEME_BANDS` below are an editorial *orientation* of how large /
 *  broad each insurer's STATED limits are in a given area. They describe the
 *  size of the wording — a factual read — NOT a recommendation, and NOT a
 *  judgement of which policy is "better". A higher band is not automatically
 *  better for any given person (excess, price, health needs all matter).
 *
 *  Bands are a first pass drafted from the policy values in
 *  `gmc_tool_data.json`. They MUST be reviewed and signed off (ideally by an
 *  adviser) before this surface goes live. Everything downstream — radar
 *  shape, journey leaders, tier badges — is a pure function of these numbers,
 *  so adjusting a band here updates the whole surface.
 *
 *  Band scale:  1 = Standard limits · 2 = Higher limits · 3 = Highest / broadest
 * ─────────────────────────────────────────────────────────────────────────
 */

// Radar axes. Each maps to a feature `group` in gmc_tool_data.json.
export const RADAR_THEMES = [
  { id: "core", label: "Core limits", short: "Core", group: "Core limits" },
  { id: "cancer", label: "Cancer care", short: "Cancer", group: "Cancer care" },
  { id: "specialists", label: "Specialists & tests", short: "Specialists", group: "Specialists & tests" },
  { id: "access", label: "Access & waits", short: "Access", group: "Conditions & waits" },
  { id: "extras", label: "Everyday extras", short: "Extras", group: "Extras" },
  { id: "loyalty", label: "Loyalty & flex", short: "Loyalty", group: "Loyalty & flexibility" },
];

// Per-insurer band (1–3) for each theme id above. See compliance note.
export const THEME_BANDS = {
  sc:  { core: 3, cancer: 2, specialists: 2, access: 2, extras: 2, loyalty: 2 },
  nib: { core: 2, cancer: 1, specialists: 3, access: 2, extras: 2, loyalty: 2 },
  aia: { core: 3, cancer: 3, specialists: 2, access: 1, extras: 1, loyalty: 3 },
  pl:  { core: 2, cancer: 2, specialists: 2, access: 1, extras: 1, loyalty: 2 },
  uni: { core: 2, cancer: 2, specialists: 3, access: 2, extras: 3, loyalty: 3 },
};

// Factual band labels + brand-teal fills used by TierBadge everywhere.
export const BAND_META = {
  1: { label: "Standard", fill: "#E1F5EE", text: "#0F6E56" },
  2: { label: "Higher", fill: "#9FE1CB", text: "#04342C" },
  3: { label: "Highest", fill: "#5DCAA5", text: "#04342C" },
};

// Care-journey stages. Each points at a radar theme; the "leader" at a stage
// is simply whichever selected insurer(s) hold the highest band for that theme.
export const JOURNEY_STAGES = [
  { id: "everyday", label: "Everyday", theme: "extras", icon: "user", headline: "GP / day-to-day add-on" },
  { id: "tests", label: "Tests", theme: "specialists", icon: "search", headline: "Specialist consultations" },
  { id: "surgery", label: "Surgery", theme: "core", icon: "scissors", headline: "Surgical benefit maximum" },
  { id: "cancer", label: "Cancer", theme: "cancer", icon: "heart", headline: "Chemotherapy / radiotherapy cover" },
  { id: "aftercare", label: "Aftercare", theme: "loyalty", icon: "refresh", headline: "Loyalty / no-claims benefits" },
];

// score 0–1 for the radar, from a 1–3 band.
export const bandToScore = (band) => (band ? band / 3 : 1 / 3);

// Among the selected insurers, the ids with the max band for a theme (ties ok).
export function leadersForTheme(themeId, insurers) {
  let best = 0;
  insurers.forEach((ins) => {
    const b = THEME_BANDS[ins.id]?.[themeId] || 0;
    if (b > best) best = b;
  });
  const leaders = insurers.filter(
    (ins) => (THEME_BANDS[ins.id]?.[themeId] || 0) === best,
  );
  return { band: best, leaders, tied: leaders.length === insurers.length };
}

// Factual "standout" line for one insurer: the theme labels where it holds its
// own highest band (used by the radar side-summary). Describes limit size only.
export function standoutThemes(insurerId) {
  const bands = THEME_BANDS[insurerId] || {};
  const top = Math.max(0, ...RADAR_THEMES.map((t) => bands[t.id] || 0));
  // Unknown insurer or all-zero bands — nothing meaningful to surface.
  if (top === 0) return { band: 0, labels: [] };
  const labels = RADAR_THEMES.filter((t) => (bands[t.id] || 0) === top).map((t) => t.label);
  return { band: top, labels };
}
