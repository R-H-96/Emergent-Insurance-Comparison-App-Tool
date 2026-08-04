import { BAND_META } from "@/data/glanceModel";
import MarkerInfo from "@/components/MarkerInfo";

/**
 * Shared factual band pill. Describes the size of a stated limit
* (Standard / Higher / Highest), never a quality judgement.
 */
export default function TierBadge({ band, className = "" }) {
  const meta = BAND_META[band];
  if (!meta) return null;
  return (
    <MarkerInfo
      title={`${meta.label} stated limits`}
label="Describes how large this policy's stated limits are in this area, measured against its own other areas. Not against the other insurers, and not a judgement of which policy is better for you."
      className={className}
    >
      <span
        className="inline-block rounded-full px-2 py-0.5 gmc-t-xs gmc-w-strong"
        style={{ background: meta.fill, color: meta.text }}
        data-testid={`tier-badge-${band}`}
      >
        {meta.label}
      </span>
    </MarkerInfo>
  );
}
