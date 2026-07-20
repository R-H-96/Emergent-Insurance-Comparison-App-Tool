import { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Table2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import AtAGlance from "@/components/AtAGlance";
import ComparisonTable from "@/components/ComparisonTable";
import FilterChips from "@/components/FilterChips";
import TrustLine from "@/components/TrustLine";
import InsurerStrip from "@/components/InsurerStrip";
import { pushEvent } from "@/lib/analytics";

/**
 * Unified surface for At-a-glance + Full comparison. A sticky segmented
 * control switches between densities. Toggle morphs in place via framer-motion
 * crossfade + auto-height. Respects prefers-reduced-motion.
 */
export default function ComparisonSurface({
  density,
  onDensityChange,
  insurers,
  allInsurers,
  onToggleInsurer,
  features,
  data,
  glossary,
  lookup,
  groupList,
  activeGroups,
  onToggleGroup,
  onClearGroups,
  diffOnly,
  onDiffOnlyChange,
  notableCount,
  preOpenGroups,
  flashFeature,
  onOpenFeature,
  onShare,
  linkCopied,
  onOpenPicker,
}) {
  const reduce = useReducedMotion();
  const initialFire = useRef(true);

  useEffect(() => {
    if (initialFire.current) {
      initialFire.current = false;
      return;
    }
    pushEvent("gmc_density_toggle", { density });
  }, [density]);

  const setDensity = (d) => {
    if (d !== density) onDensityChange(d);
  };

  const transition = reduce
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.16, 1, 0.3, 1] };

  return (
    <section
      id="comparison-surface"
      className="pb-12 sm:pb-16"
      data-testid="comparison-surface"
    >
      <div className="gmc-container">
        <InsurerStrip insurers={insurers} onChange={onOpenPicker} />

        {/* Sticky segmented control — offset supports floating nav via --gmc-sticky-offset */}
        <div
          className="sticky z-[40] py-3 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ top: "var(--gmc-sticky-offset, 0px)", background: "var(--gmc-bg)" }}
          data-testid="density-sticky"
        >
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <div
              role="tablist"
              aria-label="Comparison density"
              className="inline-flex p-1 rounded-full bg-white border shadow-[0_2px_10px_rgba(22,28,39,0.04)]"
              style={{ borderColor: "var(--gmc-line)" }}
              data-testid="density-segmented"
            >
              <SegBtn
                active={density === "glance"}
                onClick={() => setDensity("glance")}
                icon={Sparkles}
                label="At a glance"
                testid="density-glance"
                badge={notableCount}
              />
              <SegBtn
                active={density === "full"}
                onClick={() => setDensity("full")}
                icon={Table2}
                label="Full comparison"
                testid="density-full"
              />
            </div>

            <div className="flex items-center gap-2">
              {density === "full" && (
                <button
                  type="button"
                  className="gmc-chip gmc-tap"
                  aria-pressed={diffOnly}
                  onClick={() => onDiffOnlyChange(!diffOnly)}
                  data-testid="differences-only-toggle"
                >
                  <span
                    className="gmc-toggle"
                    aria-pressed={diffOnly}
                    aria-hidden="true"
                    tabIndex={-1}
                  />
                  Notable only ({notableCount})
                </button>
              )}
              <button
                type="button"
                className="gmc-chip gmc-tap"
                onClick={onShare}
                data-testid="copy-link-btn"
                aria-label="Share this comparison"
              >
                {linkCopied ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                ) : (
                  <Copy className="w-3.5 h-3.5" strokeWidth={2.2} />
                )}
                {linkCopied ? "Copied" : "Share"}
              </button>
            </div>
          </div>
        </div>

        {density === "full" && (
          <div className="mt-3">
            <TrustLine data={data} />
            <FilterChips
              groups={groupList}
              activeGroups={activeGroups}
              onToggle={onToggleGroup}
              onClear={onClearGroups}
            />
          </div>
        )}

        {/* Morphing content */}
        <motion.div
          layout={!reduce}
          transition={transition}
          className="mt-4 sm:mt-6"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={density}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={transition}
              data-testid={`density-content-${density}`}
            >
              {density === "glance" ? (
                <AtAGlance
                  features={features}
                  insurers={insurers}
                  lookup={lookup}
                  glossary={glossary}
                  notableCount={notableCount}
                  onOpen={onOpenFeature}
                />
              ) : (
                <ComparisonTable
                  insurers={insurers}
                  features={features}
                  data={data}
                  glossary={glossary}
                  diffOnly={diffOnly}
                  activeGroups={activeGroups}
                  openGroups={preOpenGroups}
                  flashFeature={flashFeature}
                  onOpenFeature={onOpenFeature}
                  onClearFilters={() => {
                    onClearGroups();
                    if (diffOnly) onDiffOnlyChange(false);
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function SegBtn({ active, onClick, icon: Icon, label, testid, badge }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className="gmc-tap inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all"
      style={{
        background: active ? "var(--gmc-teal)" : "transparent",
        color: active ? "white" : "var(--gmc-body)",
        boxShadow: active
          ? "0 4px 14px rgba(20,181,175,0.28)"
          : "none",
      }}
      data-testid={testid}
    >
      <Icon className="w-4 h-4" strokeWidth={2.2} />
      {label}
      {badge != null && (
        <span
          className="px-1.5 rounded-full text-[11px] font-extrabold"
          style={{
            background: active ? "rgba(255,255,255,0.22)" : "var(--gmc-teal-tint-2)",
            color: active ? "white" : "var(--gmc-teal-deep)",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
