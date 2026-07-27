/**
 * Personalisation model — the single source of truth for the intake flow.
 *
 * The intake asks a small number of questions and stores the answers here.
 * Everything downstream (which features surface first, how much explanation
 * shows, which view the user lands on) is a pure function of this object.
 *
 * COMPLIANCE NOTE: none of this ranks, scores or recommends a policy. It only
 * changes the ORDER and the AMOUNT OF EXPLANATION of what is shown. Every user
 * can still reach every feature via the "Everything" level.
 */

export const INTAKE_KEY = "gmc_intake_v1";

/* ── Plain-English display names ───────────────────────────────────────────
 * The data file's canonical group names stay untouched (they're the join key
 * for features). These are display-only labels for a first-time reader.
 */
export const GROUP_LABELS = {
  "Core limits": "Surgery & hospital",
  "Cancer care": "Cancer cover",
  "Specialists & tests": "Specialists & scans",
  "Conditions & waits": "Waiting periods & pre-existing",
  Extras: "Everyday care",
  Practical: "Claims & admin",
  "Loyalty & flexibility": "Switching & loyalty",
  Exclusions: "What's not covered",
};

export const groupLabel = (g) => GROUP_LABELS[g] || g;

/* Abbreviated forms for tight spaces (radar axes, journey stages). Same
 * vocabulary, fewer characters — never a different word for the same thing. */
export const GROUP_SHORT_LABELS = {
  "Core limits": "Surgery",
  "Cancer care": "Cancer",
  "Specialists & tests": "Specialists",
  "Conditions & waits": "Waiting periods",
  Extras: "Everyday care",
  Practical: "Admin",
  "Loyalty & flexibility": "Switching",
  Exclusions: "Exclusions",
};

export const groupShortLabel = (g) => GROUP_SHORT_LABELS[g] || GROUP_LABELS[g] || g;

/* ── Question 2 options → canonical data groups ─────────────────────────── */
/* Labels are DERIVED from GROUP_LABELS rather than written out again, so the
 * quiz can never drift from the chips, the table, the radar or the modal. */
export const PRIORITY_OPTIONS = [
  { id: "cancer", group: "Cancer care", blurb: "Treatment and drugs the public system won't fund", icon: "ribbon" },
  { id: "surgery", group: "Core limits", blurb: "Operations, hospital stays and what you pay first", icon: "scissors" },
  { id: "specialists", group: "Specialists & tests", blurb: "Seeing a specialist, MRIs and diagnostic tests", icon: "stethoscope" },
  { id: "everyday", group: "Extras", blurb: "GP visits, dental, optical, mental health, maternity", icon: "home" },
  { id: "waits", group: "Conditions & waits", blurb: "Conditions you already have, and stand-down times", icon: "hourglass" },
  { id: "loyalty", group: "Loyalty & flexibility", blurb: "What you gain by staying, and lose by moving", icon: "award" },
].map((o) => ({ ...o, label: GROUP_LABELS[o.group] || o.group }));

export const HOUSEHOLD_OPTIONS = [
  { id: "solo", label: "Just me", blurb: "Cover for one person" },
  { id: "couple", label: "Me and my partner", blurb: "Two adults on one decision" },
  { id: "family", label: "My family", blurb: "Adults and/or children" },
];

/**
 * One question carrying two signals: how much explanation to give, and whether
 * this person already holds cover. Asked as a single "where are you at" rather
 * than two separate screens — the flow stays at four steps, and in practice the
 * two answers correlate closely enough that splitting them cost more attention
 * than it bought precision.
 */
export const KNOWLEDGE_OPTIONS = [
  {
    id: "new",
    label: "New to health insurance",
    blurb: "I've never had a policy, and the words are unfamiliar",
    switching: false,
  },
  {
    id: "some",
    label: "I've got cover and I'm comparing",
    blurb: "Shopping around to see what else is out there",
    switching: true,
  },
  {
    id: "informed",
    label: "I know the market",
    blurb: "I understand the basics — give me the detail",
    switching: false,
  },
];

/* Switching has its own consequences — waiting periods restart, loyalty
 * benefits reset — so switchers get that group surfaced, attributed. */
export const SWITCHER_GROUP = "Loyalty & flexibility";
export const SWITCHER_LABEL = "Worth checking before you switch";

/* A household answer can suggest a group the user didn't pick — a family is
 * likely to care about everyday/maternity cover even if they didn't think to
 * choose it. These are surfaced SEPARATELY and labelled honestly; they are
 * never mixed in with what the user actually chose. */
export const HOUSEHOLD_SUGGESTED_GROUP = {
  family: "Extras",
  couple: null,
  solo: null,
};

export const HOUSEHOLD_SUGGESTION_LABEL = {
  family: "Often relevant for families",
  couple: null,
  solo: null,
};

export const DEFAULT_INTAKE = {
  household: null,
  priorities: [],
  knowledge: null,
  switching: false,
  completed: false,
  skipped: false,
};

export function loadIntake() {
  try {
    const raw = window.localStorage.getItem(INTAKE_KEY);
    if (!raw) return { ...DEFAULT_INTAKE };
    const p = JSON.parse(raw);
    return {
      household: p.household ?? null,
      priorities: Array.isArray(p.priorities) ? p.priorities.slice(0, 3) : [],
      knowledge: p.knowledge ?? null,
      switching: !!p.switching,
      completed: !!p.completed,
      skipped: !!p.skipped,
    };
  } catch (_err) {
    return { ...DEFAULT_INTAKE };
  }
}

export function saveIntake(intake) {
  try {
    window.localStorage.setItem(INTAKE_KEY, JSON.stringify({ ...intake, savedAt: Date.now() }));
  } catch (_err) { /* storage disabled */ }
}

/**
 * Canonical data-group names the user actually chose, in the order they chose
 * them. Nothing is added here — a group in this list means the user picked it,
 * which is what lets the UI say "you picked this" truthfully.
 */
export function priorityGroups(intake) {
  if (!intake) return [];
  const out = [];
  (intake.priorities || []).forEach((id) => {
    const opt = PRIORITY_OPTIONS.find((o) => o.id === id);
    if (opt && !out.includes(opt.group)) out.push(opt.group);
  });
  return out;
}

/**
 * Groups we think are worth a look based on the household answer, EXCLUDING
 * anything already chosen. Returns { group, label } so the UI can attribute
 * the suggestion rather than passing it off as the user's own choice.
 */
export function suggestedGroups(intake) {
  if (!intake) return [];
  const chosen = priorityGroups(intake);
  const out = [];
  const group = HOUSEHOLD_SUGGESTED_GROUP[intake.household];
  const label = HOUSEHOLD_SUGGESTION_LABEL[intake.household];
  if (group && label && !chosen.includes(group)) out.push({ group, label });
  if (intake.switching && !chosen.includes(SWITCHER_GROUP)) {
    out.push({ group: SWITCHER_GROUP, label: SWITCHER_LABEL });
  }
  return out;
}

/**
 * How much explanation to show.
 *   whyInline   — render the "why this matters" text expanded by default
 *   showRadar   — the coverage radar is chart-literate; hide it for beginners
 *   showJourney — the care-journey timeline
 *   defaultLevel— which rung of the disclosure ladder to land on
 */
export function explanationMode(knowledge) {
  switch (knowledge) {
    case "informed":
      return {
        whyInline: false, showRadar: true, showJourney: true,
        plainTitles: false, defaultLevel: 1,
      };
    case "some":
      return {
        whyInline: true, showRadar: false, showJourney: true,
        plainTitles: true, defaultLevel: 0,
      };
    case "new":
    default:
      return {
        whyInline: true, showRadar: false, showJourney: false,
        plainTitles: true, defaultLevel: 0,
      };
  }
}

/**
 * How to title a feature for this reader.
 *
 * A beginner stalls at "Non-Pharmac medicines cap" before they ever reach the
 * explanation underneath it, so for self-declared beginners the plain title
 * leads and the technical name becomes a subtitle. The technical name is never
 * dropped — it's the term they'd need when talking to an insurer or adviser.
 */
export function featureTitle(feature, explanation) {
  const plain = feature?.plain;
  if (!plain || explanation?.plainTitles === false) {
    return { primary: feature?.feature, secondary: null };
  }
  return { primary: plain, secondary: feature?.feature };
}

/** Short human summary of the intake, used by the receipt bar. */
export function intakeSummary(intake) {
  if (!intake || (!intake.completed && !intake.skipped)) return [];
  const bits = [];
  const hh = HOUSEHOLD_OPTIONS.find((h) => h.id === intake.household);
  if (hh) bits.push({ key: "household", label: hh.label });
  if (intake.priorities?.length) {
    const names = intake.priorities
      .map((id) => PRIORITY_OPTIONS.find((o) => o.id === id)?.label)
      .filter(Boolean);
    if (names.length) bits.push({ key: "priorities", label: `${names.join(" + ")} first` });
  }
  const kn = KNOWLEDGE_OPTIONS.find((k) => k.id === intake.knowledge);
  if (kn) {
    bits.push({
      key: "knowledge",
      label: intake.knowledge === "informed" ? "Full detail" : "Explained simply",
    });
  }
  return bits;
}
