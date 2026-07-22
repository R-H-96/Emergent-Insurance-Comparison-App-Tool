import { BAND_META } from "@/data/glanceModel";

/**
 * Shared factual band pill. Describes the size of a stated limit
 * (Standard / Higher / Highest) — never a quality judgement.
 */
export default function TierBadge({ band, className = "" }) {
  const meta = BAND_META[band];
  if (!meta) return null;
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10.5px] font-bold ${className}`}
      style={{ background: meta.fill, color: meta.text }}
      data-testid={`tier-badge-${band}`}
    >
      {meta.label}
    </span>
  );
}
