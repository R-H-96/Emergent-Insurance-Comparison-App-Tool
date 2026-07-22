import { Sparkles } from "lucide-react";
import InsurerRadar from "@/components/InsurerRadar";
import CareJourney from "@/components/CareJourney";
import DiffReel from "@/components/DiffReel";
import { isNotableForSelection } from "@/lib/notable";

/**
 * At-a-glance surface — a layered, differentiated read rather than a second
 * copy of the comparison table:
 *   1. InsurerRadar  — the *shape* of each policy (hero)
 *   2. CareJourney   — the same limits along a real health journey
 *   3. DiffReel      — only the points that actually diverge (tap → detail)
 *
 * Every layer is a pure function of the selection + glanceModel bands.
 */
export default function AtAGlance({
  features,
  insurers,
  lookup,
  glossary,
  notableCount,
  onOpen,
  onOpenGroup,
}) {
  const notable = features.filter((f) => isNotableForSelection(f, insurers, lookup));
  if (!insurers.length) return null;

  return (
    <section className="pb-8 sm:pb-14" id="at-a-glance" data-testid="at-a-glance">
      <div className="gmc-container">
        <div className="flex items-baseline gap-3 mb-1 flex-wrap">
          <Sparkles className="w-4 h-4" strokeWidth={2.2} style={{ color: "var(--gmc-teal)" }} />
          <div className="gmc-eyebrow">At a glance</div>
          <span
            className="gmc-badge-verified"
            style={{ background: "var(--gmc-teal-tint-2)", color: "var(--gmc-teal-deep)" }}
            data-testid="notable-count-chip"
          >
            {notableCount} notable difference{notableCount === 1 ? "" : "s"} found
          </span>
        </div>
        <h2 className="gmc-h2 text-2xl sm:text-3xl mb-6">How these policies really compare</h2>

        {notable.length === 0 ? (
          <div className="gmc-card p-6 sm:p-8 text-center" data-testid="at-a-glance-empty">
            <p className="text-[14px]" style={{ color: "var(--gmc-body)" }}>
              These policies agree on the notable points for this selection — switch an insurer to
              surface the interesting differences.
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            <InsurerRadar insurers={insurers} onOpenTheme={onOpenGroup} />
            <CareJourney insurers={insurers} lookup={lookup} />
            <DiffReel
              features={notable}
              insurers={insurers}
              lookup={lookup}
              glossary={glossary}
              onOpen={onOpen}
            />
          </div>
        )}
      </div>
    </section>
  );
}
