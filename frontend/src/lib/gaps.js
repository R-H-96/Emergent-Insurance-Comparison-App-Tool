/**
 * Cover-state classification.
 *
 * ─────────────────────────────────────────────────────────────────────────
 *  READ THIS BEFORE CHANGING THE MAPPING
 * ─────────────────────────────────────────────────────────────────────────
 *  The `signal` values in gmc_tool_data.json mix two very different kinds of
 *  absence, and conflating them would put a false statement on screen:
 *
* "none". The policy genuinely does not provide this.
* "not-stated". WE could not find it in the policy document. That is a
 *    "not-in-wording"  gap in our extraction, NOT a gap in the policy. Telling
 *    "none-identified" a user an insurer "doesn't cover" something on this
 *    "verify"          basis would be actively misleading.
 *
 *  So absence is reported in three states, never two. Anything not listed
 *  here is treated as covered-with-detail and shown as its stated wording.
 *
 *  The groupings below are editorial and should be reviewed alongside the
 *  THEME_BANDS sign-off before launch.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const COVER_STATE = {
  NOT_COVERED: "not-covered",
  CONDITIONAL: "conditional",
  UNSTATED: "unstated",
  COVERED: "covered",
};

const NOT_COVERED = new Set(["none", "excluded", "excluded-all"]);

const CONDITIONAL = new Set([
  "excluded-unless-accepted",
  "excluded-options-cover",
  "excluded-7-exceptions",
  "excluded-group-concessions",
  "post-cancer-only",
  "high-risk-only",
]);

// Absence of evidence, not evidence of absence.
const UNSTATED = new Set(["none-identified", "not-in-wording", "not-stated", "verify"]);

export const STATE_META = {
  [COVER_STATE.NOT_COVERED]: {
    label: "Not covered",
    help: "This policy's wording says this isn't provided. Worth checking with an adviser whether it matters for you.",
    fill: "#FCEBEB",
    text: "#A32D2D",
  },
  [COVER_STATE.CONDITIONAL]: {
    label: "Only sometimes",
help: "Covered in some circumstances only. For example if it's accepted when you apply, or if you buy an optional add-on. Open the row for the exact wording.",
    fill: "#FAEEDA",
    text: "#854F0B",
  },
  [COVER_STATE.UNSTATED]: {
    label: "Not confirmed",
help: "We haven't found this stated either way in the policy document yet. It does NOT mean the policy excludes it. It means nobody has confirmed it. Check with an adviser or the insurer before relying on it.",
    fill: "#F1EFE8",
    text: "#5F5E5A",
  },
  [COVER_STATE.COVERED]: {
    label: "Covered",
    help: "The policy provides this. Open the row for the limits and conditions that apply.",
    fill: "#E1F5EE",
    text: "#0F6E56",
  },
};

export function coverState(entry) {
  const s = entry?.signal;
  if (!s) return COVER_STATE.UNSTATED;
  if (NOT_COVERED.has(s)) return COVER_STATE.NOT_COVERED;
  if (CONDITIONAL.has(s)) return COVER_STATE.CONDITIONAL;
  if (UNSTATED.has(s)) return COVER_STATE.UNSTATED;
  return COVER_STATE.COVERED;
}

/**
 * Features worth surfacing: any where at least one selected insurer is not
 * plainly covered. Rows where the insurers disagree come first, because those
 * are the ones a comparison can actually help with.
 */
export function gapFeatures(features, insurers, lookup) {
  const rows = features
    .map((f) => {
      const states = insurers.map((ins) => coverState(lookup[ins.id]?.[f.feature]));
      const flagged = states.some((s) => s !== COVER_STATE.COVERED);
      const differs = new Set(states).size > 1;
      return { feature: f, states, flagged, differs };
    })
    .filter((r) => r.flagged);

  rows.sort((a, b) => Number(b.differs) - Number(a.differs));
  return rows;
}
