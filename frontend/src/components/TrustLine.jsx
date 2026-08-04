import { ShieldCheck } from "lucide-react";
import { ASSUME_VERIFIED } from "@/lib/config";

/**
 * "Data last verified [date | 'verification in progress'] · How we compare →"
 * Placed above the comparison table. Reads all verified fields to find the
 * latest date, or falls back to the in-progress message.
 */
export default function TrustLine({ data, className = "" }) {
  const rows = Object.values(data || {}).flat();
  const dates = rows
    .map((r) => {
      if (!r?.verified || typeof r.verified !== "string") return null;
      const m = r.verified.match(/(\d{4}-\d{2}-\d{2})/);
      return m ? m[1] : null;
    })
    .filter(Boolean)
    .sort();

  const latest = dates.length ? dates[dates.length - 1] : null;
  const label = ASSUME_VERIFIED
    ? "Checked against policy documents"
    : latest
      ? `Data last verified ${latest}`
      : "Verification in progress";

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-2.5 gmc-t-sm ${className}`}
      data-testid="trust-line"
    >
      <span
        className="inline-flex items-center gap-1.5 gmc-w-strong"
        style={{ color: "var(--gmc-teal-deep)" }}
      >
        <ShieldCheck className="w-4 h-4" strokeWidth={2.2} />
        {label}
      </span>
      <span aria-hidden style={{ color: "var(--gmc-muted)" }}>·</span>
      <a
        href="/compare/how-we-compare"
        className="gmc-w-strong underline underline-offset-2 decoration-dotted hover:decoration-solid"
        style={{ color: "var(--gmc-teal-deep)" }}
        data-testid="how-we-compare-link"
      >
        How we compare →
      </a>
    </div>
  );
}
