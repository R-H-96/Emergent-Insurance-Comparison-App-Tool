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
 *
 * Row is a div[role=button] rather than <button> because GlossaryText renders
 * glossary-term triggers as <button> elements — nested <button> is invalid HTML.
 */
export default function DiffReel({ features, insurers, lookup, glossary, onOpen }) {
  if (!features.length) return null;

  return (
    <div className="gmc-card overflow-hidden" data-testid="diff-reel">
      <div className="px-5 sm:px-6 pt-5 pb-4 flex items-baseline gap-2.5 flex-wrap">
        <div
          className="text-[18px] sm:text-[20px] font-extrabold tracking-tight"
          style={{ color: "var(--gmc-ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Where they differ
        </div>
        <span
          className="gmc-badge-verified"
          style={{ background: "var(--gmc-teal-tint-2)", color: "var(--gmc-teal-deep)" }}
        >
          {features.length} point{features.length === 1 ? "" : "s"}
        </span>
      </div>

      {features.map((f) => (
        <div
          key={f.feature}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(f.feature)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(f.feature); } }}
          className="w-full text-left px-5 sm:px-6 py-4 border-t transition-colors hover:bg-[color:var(--gmc-teal-tint)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gmc-teal)] cursor-pointer"
          style={{ borderColor: "var(--gmc-line)" }}
          data-testid={`diff-row-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
        >
          <div
            className="flex items-center gap-2 font-extrabold text-[15px] leading-snug"
            style={{ color: "var(--gmc-ink)" }}
          >
            <FeatureIcon name={f.feature} size={18} />
            <span className="flex-1">{f.feature}</span>
            <ChevronRight
              className="w-4 h-4 flex-shrink-0 transition-colors"
              strokeWidth={2.2}
              style={{ color: "var(--gmc-faint)" }}
            />
          </div>
          {f.definition && (
            <div className="mt-1.5 text-[12px] leading-snug" style={{ color: "var(--gmc-muted)" }}>
              <GlossaryText tag="span" text={f.definition} glossary={glossary} />
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {insurers.map((ins) => {
              const entry = lookup[ins.id]?.[f.feature];
              return (
                <span key={ins.id} className="flex items-center gap-1.5 min-w-0">
                  <InsurerMark insurer={ins} size={22} />
                  <span
                    className="text-[13px] font-semibold"
                    style={{ color: "var(--gmc-ink-2)" }}
                  >
                    {entry?.short ? (
                      <GlossaryText tag="span" text={entry.short} glossary={glossary} />
                    ) : (
                      <span style={{ color: "var(--gmc-faint)" }}>—</span>
                    )}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
