import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Target, Activity, Layers } from "lucide-react";
import InsurerRadar from "@/components/InsurerRadar";
import CareJourney from "@/components/CareJourney";
import DiffReel from "@/components/DiffReel";
import { isNotableForSelection } from "@/lib/notable";

const SLIDES = [
  { key: "radar", label: "Overview", Icon: Target },
  { key: "journey", label: "Journey", Icon: Activity },
  { key: "diff", label: "Differences", Icon: Layers },
];

/**
 * At-a-glance surface.
 *
 * Mobile: tabbed carousel — three pill tabs (Overview / Journey / Differences)
 * using the same visual language as the density segmented control. Content
 * crossfades with a directional x-slide matching navigation direction.
 *
 * Desktop (sm+): original vertical stack unchanged.
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
  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduce = useReducedMotion();

  if (!insurers.length) return null;

  const goToSlide = (i) => {
    setDirection(i > activeSlide ? 1 : -1);
    setActiveSlide(i);
  };

  const slideComponents = [
    <InsurerRadar key="radar" insurers={insurers} onOpenTheme={onOpenGroup} />,
    <CareJourney key="journey" insurers={insurers} lookup={lookup} />,
    <DiffReel
      key="diff"
      features={notable}
      insurers={insurers}
      lookup={lookup}
      glossary={glossary}
      onOpen={onOpen}
    />,
  ];

  return (
    <section className="pb-4 sm:pb-14" id="at-a-glance" data-testid="at-a-glance">
      <div className="gmc-container">
        <div className="flex items-baseline gap-3 mb-1 flex-wrap">
          <Sparkles
            className="w-4 h-4"
            strokeWidth={2.2}
            style={{ color: "var(--gmc-teal)" }}
          />
          <div className="gmc-eyebrow">At a glance</div>
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
            <p className="text-[14px]" style={{ color: "var(--gmc-body)" }}>
              These policies agree on the notable points for this selection — switch an insurer to
              surface the interesting differences.
            </p>
          </div>
        ) : (
          <>
            {/* ── Mobile: tabbed carousel ───────────────────────── */}
            <div className="sm:hidden">
              <div
                role="tablist"
                aria-label="At a glance sections"
                className="flex p-1 rounded-full bg-white border shadow-[0_2px_10px_rgba(22,28,39,0.04)] mb-4"
                style={{ borderColor: "var(--gmc-line)" }}
              >
                {SLIDES.map((s, i) => (
                  <button
                    key={s.key}
                    type="button"
                    role="tab"
                    aria-selected={activeSlide === i}
                    onClick={() => goToSlide(i)}
                    className="gmc-tap flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold transition-all"
                    style={{
                      background: activeSlide === i ? "var(--gmc-teal)" : "transparent",
                      color: activeSlide === i ? "white" : "var(--gmc-body)",
                      boxShadow: activeSlide === i
                        ? "0 4px 14px rgba(20,181,175,0.28)"
                        : "none",
                    }}
                    data-testid={`glance-tab-${s.key}`}
                  >
                    <s.Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                    <span>{s.label}</span>
                    {s.key === "diff" && notableCount != null && (
                      <span
                        className="ml-0.5 px-1.5 rounded-full text-[10px] font-extrabold"
                        style={{
                          background:
                            activeSlide === i
                              ? "rgba(255,255,255,0.22)"
                              : "var(--gmc-teal-tint-2)",
                          color: activeSlide === i ? "white" : "var(--gmc-teal-deep)",
                        }}
                      >
                        {notableCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div style={{ overflow: "hidden" }}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activeSlide}
                    initial={reduce ? false : { opacity: 0, x: direction * 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -24 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {slideComponents[activeSlide]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* ── Desktop: vertical stack (unchanged) ─────────── */}
            <div className="hidden sm:block space-y-5">
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
          </>
        )}
      </div>
    </section>
  );
}
