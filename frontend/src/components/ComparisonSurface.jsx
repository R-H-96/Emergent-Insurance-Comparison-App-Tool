import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Table2 } from "lucide-react";
import AtAGlance from "@/components/AtAGlance";
import ComparisonTable from "@/components/ComparisonTable";
import FilterChips from "@/components/FilterChips";
import TrustLine from "@/components/TrustLine";
import InsurerStrip from "@/components/InsurerStrip";
import { pushEvent } from "@/lib/analytics";

export default function ComparisonSurface({
  density, onDensityChange,
  insurers, allInsurers, onToggleInsurer,
  features, data, glossary, lookup,
  groupList, activeGroups, onToggleGroup, onClearGroups,
  diffOnly, onDiffOnlyChange, notableCount,
  preOpenGroups, flashFeature, onOpenFeature, onOpenGroup,
  onShare, linkCopied, onOpenPicker,
}) {
  const reduce = useReducedMotion();
  const initialFire = useRef(true);

  useEffect(() => {
    if (initialFire.current) { initialFire.current = false; return; }
    pushEvent("gmc_density_toggle", { density });
  }, [density]);

  const setDensity = (d) => { if (d !== density) onDensityChange(d); };
  const transition = reduce ? { duration: 0 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] };

  return (
    <section id="comparison-surface" className="pb-12 sm:pb-16" data-testid="comparison-surface">
      <div className="gmc-container">
        <InsurerStrip insurers={insurers} onChange={onOpenPicker} />

        {/* Sticky density bar */}
        <div
          className="sticky z-[40] py-3 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ top: "var(--gmc-sticky-offset, 0px)", background: "var(--gmc-bg)" }}
          data-testid="density-sticky"
        >
          <div className="flex items-center justify-between gap-3">
            {/*
             * Segmented control: full-width on mobile (flex) so the tabs own
             * the entire row now that the notable toggle is gone from mobile.
             * Reverts to inline-flex on sm+ where the notable toggle may appear.
             */}
            <div
              role="tablist"
              aria-label="Comparison density"
              className="flex sm:inline-flex p-1 rounded-full bg-white border shadow-[0_2px_10px_rgba(22,28,39,0.04)]"
              style={{ borderColor: "var(--gmc-line)" }}
              data-testid="density-segmented"
            >
              <SegBtn
                active={density === "glance"}
                onClick={() => setDensity("glance")}
                icon={Sparkles}
                label="Quick Comparison"
                shortLabel="Quick"
                testid="density-glance"
                badge={notableCount}
              />
              <SegBtn
                active={density === "full"}
                onClick={() => setDensity("full")}
                icon={Table2}
                label="Full Comparison"
                shortLabel="Full"
                testid="density-full"
              />
            </div>

            {/* Notable toggle — desktop only, full density only */}
            {density === "full" && (
              <button
                type="button"
                className="gmc-chip gmc-tap hidden sm:inline-flex"
                aria-pressed={diffOnly}
                onClick={() => onDiffOnlyChange(!diffOnly)}
                data-testid="differences-only-toggle"
              >
                <span className="gmc-toggle" aria-pressed={diffOnly} aria-hidden="true" tabIndex={-1} />
                Notable differences
              </button>
            )}
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

        <motion.div layout={!reduce} transition={transition} className="mt-4 sm:mt-6">
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
                  features={features} insurers={insurers} lookup={lookup} glossary={glossary}
                  notableCount={notableCount} onOpen={onOpenFeature} onOpenGroup={onOpenGroup}
                />
              ) : (
                <ComparisonTable
                  insurers={insurers} features={features} data={data} glossary={glossary}
                  diffOnly={diffOnly} activeGroups={activeGroups} openGroups={preOpenGroups}
                  flashFeature={flashFeature} onOpenFeature={onOpenFeature}
                  onClearFilters={() => { onClearGroups(); if (diffOnly) onDiffOnlyChange(false); }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function SegBtn({ active, onClick, icon: Icon, label, shortLabel, testid, badge }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`gmc-tap flex sm:inline-flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 py-2 rounded-full text-[13px] transition-all ${
        active ? "font-bold" : "font-semibold"
      }`}
      style={{
        background: active ? "var(--gmc-teal)" : "transparent",
        color: active ? "white" : "var(--gmc-body)",
        boxShadow: active ? "0 4px 14px rgba(20,181,175,0.28)" : "none",
      }}
      data-testid={testid}
    >
      <Icon className="w-4 h-4" strokeWidth={2.2} />
      <span className="hidden sm:inline">{label}</span>
      {shortLabel && <span className="sm:hidden">{shortLabel}</span>}
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
