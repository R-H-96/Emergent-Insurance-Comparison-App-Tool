import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Target, Activity, Layers, ChevronDown, ChevronRight } from "lucide-react";
import InsurerRadar from "@/components/InsurerRadar";
import CareJourney from "@/components/CareJourney";
import DifferencesPanel from "@/components/DifferencesPanel";
import { isNotableForSelection } from "@/lib/notable";

/**
* Rung 1 of the disclosure ladder, "All differences".
 *
 * Which panels appear depends on how much insurance knowledge the reader told
 * us they have (see explanationMode in lib/personalisation):
* new. The prose diff reel only. A six-axis radar is an abstraction on
 *              top of an abstraction for someone still learning the words.
* some, journey timeline + diff reel.
* informed, everything, including the radar.
 *
 * Mobile shows whichever panels are enabled as a tabbed carousel; desktop
 * stacks them.
 */
const DEFAULT_EXPLANATION = { showRadar: true, showJourney: true };

export default function AtAGlance({
  features,
  insurers,
  lookup,
  glossary,
  notableCount,
  explanation = DEFAULT_EXPLANATION,
  highlightGroups = [],
  onOpen,
  onOpenGroup,
}) {
  const notable = features.filter((f) => isNotableForSelection(f, insurers, lookup));
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();

  if (!insurers.length) return null;

// Hiding the chart outright from beginners was too blunt, it's offered,
  // just folded away so it can't be the first thing that greets them.
  const radarOpenByDefault = explanation?.showRadar !== false;
  const showRadar = true;
  const showJourney = explanation?.showJourney !== false;

  const panels = [];
  if (showRadar) {
    panels.push({
      key: "radar",
      label: "Overview",
      Icon: Target,
      collapsible: !radarOpenByDefault,
      node: (
        <InsurerRadar
          insurers={insurers}
          features={features}
          lookup={lookup}
          glossary={glossary}
          highlightGroups={highlightGroups}
          onOpenTheme={onOpenGroup}
          onOpenFeature={onOpen}
        />
      ),
    });
  }
  if (showJourney) {
    panels.push({
      key: "journey",
      label: "Journey",
      Icon: Activity,
      node: <CareJourney insurers={insurers} lookup={lookup} onOpen={onOpen} />,
    });
  }
  panels.push({
    key: "diff",
    label: "Differences",
    Icon: Layers,
    node: (
      <DifferencesPanel
        features={features}
        insurers={insurers}
        lookup={lookup}
        glossary={glossary}
        explanation={explanation}
        onOpen={onOpen}
      />
    ),
  });

  const goToSlide = (i) => {
    setDirection(i > activeSlide ? 1 : -1);
    setActiveSlide(i);
  };
  const safeSlide = Math.min(activeSlide, panels.length - 1);

  return (
    <section className="pb-4 sm:pb-14" id="at-a-glance" data-testid="at-a-glance">
      <div className="flex items-baseline gap-3 mb-1 flex-wrap">
        <div className="gmc-eyebrow">Where these policies differ</div>
        <span
          className="gmc-badge-verified"
          style={{ background: "var(--gmc-teal-tint-2)", color: "var(--gmc-teal-deep)" }}
          data-testid="notable-count-chip"
        >
          {notableCount} notable difference{notableCount === 1 ? "" : "s"} found
        </span>
      </div>
      <h2 className="gmc-h2 text-2xl sm:text-3xl mb-4 sm:mb-6">
        How these policies really compare
      </h2>

      {notable.length === 0 ? (
        <div className="gmc-card p-6 sm:p-8 text-center" data-testid="at-a-glance-empty">
          <p className="gmc-t-base" style={{ color: "var(--gmc-body)" }}>
These policies agree on the notable points for this selection, switch an
            insurer to surface the interesting differences.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile: tabbed carousel (only if there's more than one panel) */}
          <div className="sm:hidden">
            {panels.length > 1 && (
              <div
                role="tablist"
                aria-label="Difference views"
                className="flex p-1 rounded-full bg-white border shadow-[var(--gmc-shadow-card)] mb-4"
                style={{ borderColor: "var(--gmc-line)" }}
              >
                {panels.map((s, i) => (
                  <button
                    key={s.key}
                    type="button"
                    role="tab"
                    aria-selected={safeSlide === i}
                    onClick={() => goToSlide(i)}
                    className="gmc-tap flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full gmc-t-sm gmc-w-strong transition-all"
                    style={{
                      background: safeSlide === i ? "var(--gmc-teal)" : "transparent",
                      color: safeSlide === i ? "white" : "var(--gmc-body)",
                      boxShadow: safeSlide === i ? "0 4px 14px rgba(20,181,175,0.28)" : "none",
                    }}
                    data-testid={`glance-tab-${s.key}`}
                  >
                    <s.Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                    <span>{s.label}</span>
                    {s.key === "diff" && notableCount != null && (
                      <span
                        className="ml-0.5 px-1.5 rounded-full gmc-t-xs gmc-w-heavy"
                        style={{
                          background:
                            safeSlide === i ? "rgba(255,255,255,0.22)" : "var(--gmc-teal-tint-2)",
                          color: safeSlide === i ? "white" : "var(--gmc-teal-deep)",
                        }}
                      >
                        {notableCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div style={{ overflow: "hidden" }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={safeSlide}
                  initial={reduce ? false : { opacity: 0, x: direction * 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -24 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  {panels[safeSlide]?.node}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop: vertical stack */}
          <div className="hidden sm:block space-y-5">
            {panels.map((p) =>
              p.collapsible ? (
                <CollapsedPanel key={p.key} label="Coverage profile chart">
                  {p.node}
                </CollapsedPanel>
              ) : (
                <div key={p.key}>{p.node}</div>
              ),
            )}
          </div>
        </>
      )}
    </section>
  );
}

function CollapsedPanel({ label, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="gmc-inset gmc-tap w-full flex items-center gap-2 px-4 py-3 text-left transition-colors"

        data-testid="collapsed-panel-toggle"
      >
        {open
          ? <ChevronDown className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} style={{ color: "var(--gmc-teal-deep)" }} />
          : <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} style={{ color: "var(--gmc-teal-deep)" }} />}
        <span className="gmc-t-sm gmc-w-strong" style={{ color: "var(--gmc-ink)" }}>
          {open ? "Hide" : "Show"} the {label.toLowerCase()}
        </span>
        <span className="gmc-t-sm ml-auto" style={{ color: "var(--gmc-muted)" }}>
A visual summary. More detail than most people need
        </span>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}
