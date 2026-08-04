import { Check, Clock } from "lucide-react";
import MarkerInfo from "@/components/MarkerInfo";
import { isVerified, ASSUME_VERIFIED } from "@/lib/config";

/** Small icon-only verified/pending indicator for table cells. */
export function VerifiedIcon({ verified }) {
  if (isVerified(verified)) {
    const when =
      !ASSUME_VERIFIED && typeof verified === "string"
        ? verified.split(" ").slice(1).join(" ")
        : "";
    return (
      <MarkerInfo
        title="Checked against the policy"
        label={`Someone has read this value in the insurer's own policy document and confirmed it${when ? ` (${when})` : ""}. Open the row to see the exact wording and a link to the source.`}
      >
        <span
          className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full flex-shrink-0"
          style={{ background: "var(--gmc-teal-tint-2)", color: "var(--gmc-teal-deep)" }}
          data-testid="verified-icon"
        >
          <Check className="w-[11px] h-[11px]" strokeWidth={3} />
        </span>
      </MarkerInfo>
    );
  }
  return (
    <MarkerInfo
      title="Still being checked"
      label="We've taken this from the insurer's policy document but haven't finished double-checking it. Confirm anything important against the source document before you rely on it."
    >
      <span
        className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full flex-shrink-0"
        style={{ background: "var(--gmc-bg-soft)", color: "var(--gmc-muted)" }}
        data-testid="pending-icon"
      >
        <Clock className="w-[10px] h-[10px]" strokeWidth={2.5} />
      </span>
    </MarkerInfo>
  );
}

/** Full pill badge used in the detail modal. */
export function VerifiedBadge({ verified }) {
  if (isVerified(verified)) {
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
