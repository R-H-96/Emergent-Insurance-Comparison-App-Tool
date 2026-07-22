import { ChevronRight } from "lucide-react";
import FeatureIcon from "@/components/FeatureIcon";
import InsurerMark from "@/components/InsurerMark";
import GlossaryText from "@/components/GlossaryText";

/**
 * Differences-only reel. Takes the already pair-aware "notable" feature list
 * and shows just the contrasts: feature name + each insurer's stated value
 * inline. Everything the policies agree on has already been filtered out
 * upstream, so this is purely "here's where they diverge". Tap a row for the
 * full, sourced detail.
 */
export default function DiffReel({ features, insurers, lookup, glossary, onOpen }) {
  if (!features.length) return null;

  return (
    <div className="gmc-card overflow-hidden" data-testid="diff-reel">
      <div className="px-5 sm:px-6 pt-5 pb-3 flex items-baseline gap-2 flex-wrap">
        <div className="text-[13px] sm:text-[14px] font-extrabold" style={{ color: "var(--gmc-ink)" }}>
          Where they differ
        </div>
        <span className="text-[12px]" style={{ color: "var(--gmc-muted)" }}>
          — the {features.length} points that actually diverge
        </span>
      </div>

      {features.map((f) => (
        <button
          key={f.feature}
          type="button"
          onClick={() => onOpen(f.feature)}
          className="w-full text-left px-5 sm:px-6 py-3.5 border-t transition-colors hover:bg-[color:var(--gmc-teal-tint)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gmc-teal)]"
          style={{ borderColor: "var(--gmc-line)" }}
          data-testid={`diff-row-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
        >
          <div
            className="flex items-center gap-2 font-bold text-[15px] sm:text-[14px] leading-snug"
            style={{ color: "var(--gmc-ink)" }}
          >
            <FeatureIcon name={f.feature} size={18} />
            <span className="flex-1">{f.feature}</span>
            <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.2} style={{ color: "var(--gmc-faint)" }} />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
            {insurers.map((ins) => {
              const entry = lookup[ins.id]?.[f.feature];
              return (
                <span key={ins.id} className="flex items-center gap-1.5 min-w-0">
                  <InsurerMark insurer={ins} size={16} />
                  <span className="text-[13px] sm:text-[12.5px] font-semibold" style={{ color: "var(--gmc-ink-2)" }}>
                    {entry?.short ? (
                      <GlossaryText text={entry.short} glossary={glossary} />
                    ) : (
                      <span className="italic font-normal" style={{ color: "var(--gmc-faint)" }}>
                        Not extracted
                      </span>
                    )}
                  </span>
                </span>
              );
            })}
          </div>
        </button>
      ))}
    </div>
  );
}
