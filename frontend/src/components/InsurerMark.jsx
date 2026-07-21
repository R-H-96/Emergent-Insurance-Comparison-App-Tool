/**
 * Round insurer mark — used everywhere the wordmark is NOT appropriate
 * (rail chips, "Comparing" strip, modal blocks, ask panel result rows).
 *
 * Two rendering modes:
 *   • For insurers whose brand has a clean symbol (SC, nib, AIA) — a pre-
 *     cropped square PNG (`/logos/marks/{id}.png`) is loaded on white and
 *     clipped into a circle.
 *   • For insurers without a distinctive symbol (Partners Life, UniMed) —
 *     a solid circle in the insurer's accent colour with white initials.
 *
 * Sizes are strict: 40 on the rail, 32 in modal blocks, 28 in chips, 20
 * inline. Same baseline everywhere via `flex-shrink-0` + fixed w/h.
 */
const MARK_IDS = new Set(["sc", "nib", "aia"]);

export default function InsurerMark({ insurer, size = 32, className = "" }) {
  const hasMark = MARK_IDS.has(insurer.id);
  const initials = insurer.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const accent = insurer.accent || "var(--gmc-teal)";

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full overflow-hidden flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: hasMark ? "white" : accent,
        border: hasMark ? "1px solid var(--gmc-line-soft)" : "none",
      }}
      data-testid={`insurer-mark-${insurer.id}`}
      aria-hidden="true"
    >
      {hasMark ? (
        <img
          src={`/logos/marks/${insurer.id}.png`}
          alt=""
          className="w-full h-full object-contain"
          style={{ padding: Math.max(2, size * 0.08) }}
          loading="lazy"
        />
      ) : (
        <span
          className="text-white font-extrabold leading-none"
          style={{
            fontSize: size * 0.42,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
