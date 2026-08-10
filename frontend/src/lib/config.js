/**
 * ─────────────────────────────────────────────────────────────────────────
* ⚠ ASSUME_VERIFIED. MUST BE FALSE BEFORE THIS GOES ANYWHERE PUBLIC
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  When true, every value renders with the "Checked against the policy" marker
* even though nothing in gmc_tool_data.json has actually been verified, all
 *  125 values are still `"verified": "pending"`.
 *
 *  This exists so the tool can be demoed without every row shouting "still
 *  being checked". It is a DISPLAY override only. The data file is deliberately
* left truthful, so nothing here has to be undone later, flip this one flag
 *  and the tool tells the truth again.
 *
 *  Why it's a flag and not an edit to the data:
 *    · "Every value is cited and checked" is the product's entire claim. Baking
 *      a false verified state into the dataset would make that claim unfalsifiable
* from inside the repo. You'd have no record of what was actually checked.
 *    · The launch rule in the original UI/UX map is explicit: nothing renders as
 *      Verified unless the source says YES.
 *
 *  Turn it off with an env var without touching code:
 *      REACT_APP_ASSUME_VERIFIED=false
 *
 *  Progress lives in GMC_Verification_Checklist.xlsx. When that hits 100%, the
 *  data file's `verified` fields get set for real and this flag is deleted.
 */
export const ASSUME_VERIFIED =
  process.env.REACT_APP_ASSUME_VERIFIED !== "false";

/** True when a value should display as checked. */
export function isVerified(verified) {
  if (ASSUME_VERIFIED) return true;
  return (
    typeof verified === "string" &&
    (verified === "verified" || verified.startsWith("verified"))
  );
}

/**
 * Where the tool's own static files live.
 *
 * Embedded, this bundle runs on getmycover.co.nz while its images sit on
 * GitHub Pages. A relative path resolves against the host domain and 404s, and
 * CRA's PUBLIC_URL is only ever a pathname, so it cannot help across origins.
 * The origin has to be stated.
 *
 * Override at build time with REACT_APP_ASSET_BASE if the tool moves.
 */
export const ASSET_BASE = (
  process.env.REACT_APP_ASSET_BASE ||
  "https://r-h-96.github.io/Emergent-Insurance-Comparison-App-Tool"
).replace(/\/$/, "");

/** Absolute URL for a file in the tool's public folder. */
export const asset = (path) => `${ASSET_BASE}/${String(path).replace(/^\//, "")}`;
