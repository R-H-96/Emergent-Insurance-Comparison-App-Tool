import { Check, Clock } from "lucide-react";

/** Small icon-only verified/pending indicator for table cells. */
export function VerifiedIcon({ verified }) {
  const isVerified =
    typeof verified === "string" &&
    (verified === "verified" || verified.startsWith("verified"));
  if (isVerified) {
    return (
      <span
        className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full flex-shrink-0"
        style={{ background: "var(--gmc-teal-tint-2)", color: "var(--gmc-teal-deep)" }}
        title="Verified"
        aria-label="Verified"
        data-testid="verified-icon"
      >
        <Check className="w-[11px] h-[11px]" strokeWidth={3} />
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full flex-shrink-0"
      style={{ background: "var(--gmc-bg-soft)", color: "var(--gmc-faint)" }}
      title="Pending verification"
      aria-label="Pending verification"
      data-testid="pending-icon"
    >
      <Clock className="w-[10px] h-[10px]" strokeWidth={2.5} />
    </span>
  );
}

/** Full pill badge used in the detail modal. */
export function VerifiedBadge({ verified }) {
  const isVerified =
    typeof verified === "string" &&
    (verified === "verified" || verified.startsWith("verified"));
  if (isVerified) {
    const date = verified.split(" ").slice(1).join(" ");
    return (
      <span className="gmc-badge-verified" data-testid="badge-verified">
        <Check className="w-[10px] h-[10px]" strokeWidth={3} />
        Verified{date ? ` ${date}` : ""}
      </span>
    );
  }
  return (
    <span className="gmc-badge-pending" data-testid="badge-pending">
      <Clock className="w-[10px] h-[10px]" strokeWidth={2.5} />
      Pending verification
    </span>
  );
}
