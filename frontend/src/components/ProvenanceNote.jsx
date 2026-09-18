import { isVerified } from "@/lib/config";

/**
 * States where a value came from, in the same slot, whatever the answer.
 *
 * Why this replaces the tick
 * --------------------------
 * Every row carried a tick. A marker that is always present carries no
 * information, and while ASSUME_VERIFIED is on it is also not true.
 *
 * The harder problem is what the row looks like AFTER the verification pass
 * starts. 125 values flip state one at a time, so for a long while the table
 * is mixed. A design that marks only the exception inverts its own meaning
 * halfway through that process: early on the exception is "checked", later it
 * is "not checked". The same glyph would mean opposite things in March and in
 * June.
 *
 * So both states are stated, both are quiet, and neither decorates. The
 * difference is legible on inspection without turning an unverified table into
 * a wall of warnings, which is the thing that would tempt anyone to leave
 * ASSUME_VERIFIED on.
 *
 * Deliberately not a colour: colour means insurer in this row, and provenance
 * is not an insurer property.
 */
export default function ProvenanceNote({ verified, className = "" }) {
  const ok = isVerified(verified);

  // "verified 2026-08-11" carries a date worth showing. Bare "verified" does
  // not, and neither does the ASSUME_VERIFIED override.
  const date =
    typeof verified === "string" ? (verified.match(/(\d{4}-\d{2}-\d{2})/) || [])[1] : null;

  const label = ok ? (date ? `Checked ${date}` : "Checked") : "Not confirmed";

  return (
    <span
      className={`gmc-t-xs flex-shrink-0 ${className}`}
      style={{ color: "var(--gmc-muted)" }}
      title={
        ok
          ? "This value was read from the insurer's own policy wording."
          : "We have not yet confirmed this value against the policy wording."
      }
      data-testid={ok ? "provenance-checked" : "provenance-unconfirmed"}
    >
      {label}
    </span>
  );
}
