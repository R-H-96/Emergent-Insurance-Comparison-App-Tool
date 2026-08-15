import { useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { UserRound, Layers, Table2, Share2, SlidersHorizontal, Pencil, Printer } from "lucide-react";
import AtAGlance from "@/components/AtAGlance";
import ComparisonTable from "@/components/ComparisonTable";
import PriorityCards from "@/components/PriorityCards";
import FilterChips from "@/components/FilterChips";
import TrustLine from "@/components/TrustLine";
import ReceiptBar from "@/components/ReceiptBar";
import InsurerMark from "@/components/InsurerMark";
import { BookOpen } from "lucide-react";
import { priorityGroups } from "@/lib/personalisation";
import { pushEvent } from "@/lib/analytics";

/**
 * The comparison surface, organised around ONE control: a three-rung
 * disclosure ladder.
 *
* 0 · Your priorities. PriorityCards. The differences inside the groups
 *                          the user chose, each with plain-English context.
* 1 · All differences. AtAGlance (radar / journey / diff reel), with the
 *                          chart-heavy panels hidden for self-declared
 *                          beginners.
* 2 · Everything, the full 25-feature grouped table.
 *
 * This ladder replaces BOTH the old Quick/Full density segmented control and
* the separate "notable differences only" toggle, rungs 0 and 1 are
 * inherently difference-only, so the toggle had nothing left to do. Group
 * filters are only relevant at rung 2, so they only appear there.
 */
export const LADDER = [
  { id: 0, label: "Your priorities", short: "Yours", icon: UserRound, hint: "The things you told us matter most, in plain English." },
  { id: 1, label: "All differences", short: "Differences", icon: Layers, hint: "Every point where these policies actually differ." },
  { id: 2, label: "Everything", short: "All", icon: Table2, hint: "All 25 features, grouped. Nothing hidden." },
];

export default function ComparisonSurface({
  level, onLevelChange,
  insurers, features, data, glossary, lookup,
  groupList, activeGroups, onToggleGroup, onClearGroups,
  notableCount, intake, explanation,
  preOpenGroups, flashFeature, onOpenFeature, onOpenGroup,
  onShare, linkCopied, onOpenPicker, onEditIntake, onOpenGlossary,
  coachPicker = false,
}) {
  const reduce = useReducedMotion();
  const initialFire = useRef(true);

  useEffect(() => {
    if (initialFire.current) { initialFire.current = false; return; }
    pushEvent("gmc_level_change", { level });
  }, [level]);

  const transition = reduce ? { duration: 0 } : { duration: 0.28, ease: [0.16, 1, 0.3, 1] };
  const current = LADDER.find((l) => l.id === level) || LADDER[0];

  return (
    <section id="comparison-surface" className="pb-12 sm:pb-16 print:hidden" data-testid="comparison-surface">
      <div className="gmc-container">
        {insurers.length < 2 && (
          <div className="gmc-surface p-8 text-center" data-testid="needs-insurers">
            <h2 className="gmc-t-xl gmc-w-heavy mb-2" style={{ color: "var(--gmc-ink)" }}>
              Pick two or three insurers
            </h2>
            <p className="gmc-t-base mb-5" style={{ color: "var(--gmc-body)" }}>
              Nothing is chosen for you. Tell us who you want to compare and we will line
              their policies up side by side.
            </p>
            <button
              type="button"
              className="gmc-btn-primary gmc-tap"
              onClick={onOpenPicker}
              data-testid="needs-insurers-cta"
            >
              Choose insurers
            </button>
          </div>
        )}
        {insurers.length >= 2 && (<>
        <ReceiptBar
          intake={intake}
          insurers={insurers}
          onEditIntake={onEditIntake}
          onEditInsurers={onOpenPicker}
          coach={coachPicker}
        />

        {/* Sticky ladder.
            The old version bled to the edges with -mx-4 px-4 on mobile only,
            which left the background stopping at the container edge on desktop
            and reading as a ragged block rather than a bar. gmc-sticky-bleed
            paints full width at every size using a pseudo-element, so the
            controls keep their container padding while the surface behind them
            runs edge to edge. The top offset comes from the same variable the
            embed sets to the host navbar height, and the bar's own top padding
            is folded into that so no gap opens under the header. */}
        <div
          className="gmc-sticky-bleed sticky z-[40] py-3"
          style={{ top: "var(--gmc-sticky-offset, 0px)" }}
          data-testid="ladder-sticky"
        >
          <div className="flex items-center gap-2">
            <div
              role="tablist"
              aria-label="How much detail to show"
              className="flex flex-1 p-1 rounded-full bg-white border shadow-[var(--gmc-shadow-card)]"
              style={{ borderColor: "var(--gmc-line)" }}
              data-testid="ladder"
            >
              {LADDER.map((rung) => {
                const active = level === rung.id;
                const Icon = rung.icon;
                return (
                  <button
                    key={rung.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => level !== rung.id && onLevelChange(rung.id)}
                    className={`gmc-tap flex flex-1 items-center justify-center gap-1.5 px-2 sm:px-4 py-2 rounded-full gmc-t-sm sm:gmc-t-sm transition-all ${
                      active ? "gmc-w-strong" : "gmc-w-strong"
                    }`}
                    style={{
                      background: active ? "var(--gmc-teal)" : "transparent",
                      color: active ? "white" : "var(--gmc-body)",
                      boxShadow: active ? "0 4px 14px rgba(20,181,175,0.28)" : "none",
                    }}
                    data-testid={`ladder-${rung.id}`}
                  >
                    {/* Icon hidden on phones. Measured at 390px, this rung's
                        icon plus "Differences" plus the count badge came to
                        121px inside a 108px third, so the content spilled
                        under the neighbouring pill and hid the count. The
                        labels carry the meaning; the icons are decorative. */}
                    <Icon className="hidden sm:block w-4 h-4 flex-shrink-0" strokeWidth={2.2} aria-hidden="true" />
                    <span className="hidden sm:inline">{rung.label}</span>
                    <span className="sm:hidden">{rung.short}</span>
                    {rung.id === 1 && notableCount != null && (
                      <span
                        className="px-1.5 rounded-full gmc-t-xs gmc-w-heavy"
                        style={{
                          background: active ? "rgba(255,255,255,0.22)" : "var(--gmc-teal-tint-2)",
                          color: active ? "white" : "var(--gmc-teal-deep)",
                        }}
                      >
                        {notableCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => { pushEvent("gmc_print", { level }); window.print(); }}
              className="gmc-tap hidden lg:flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors hover:bg-[color:var(--gmc-teal-tint)]"
              style={{ border: "1px solid var(--gmc-line)", background: "white" }}
              aria-label="Print or save this comparison to take to an adviser"
              data-testid="print-btn"
            >
              <Printer className="w-4 h-4" strokeWidth={2.2} style={{ color: "var(--gmc-body)" }} />
            </button>

            <button
              type="button"
              onClick={onShare}
              className="gmc-tap hidden lg:flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 transition-colors hover:bg-[color:var(--gmc-teal-tint)]"
              style={{ border: "1px solid var(--gmc-line)", background: "white" }}
              aria-label="Share this comparison"
              data-testid="share-btn"
            >
              <Share2 className="w-4 h-4" strokeWidth={2.2} style={{ color: linkCopied ? "var(--gmc-teal)" : "var(--gmc-body)" }} />
            </button>
          </div>
        </div>

        <div className="pt-2 flex items-baseline gap-3 flex-wrap">
          <p className="gmc-t-sm leading-snug" style={{ color: "var(--gmc-muted)" }}>
            {current.hint}
          </p>
          <button
            type="button"
            onClick={onOpenGlossary}
            className="gmc-tap inline-flex items-center gap-1 gmc-t-sm gmc-w-strong underline decoration-dotted underline-offset-2 hover:decoration-solid"
            style={{ color: "var(--gmc-teal-deep)" }}
            data-testid="open-glossary"
          >
            <BookOpen className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.2} aria-hidden="true" />
            What the words mean
          </button>
        </div>

{/* Group filters. Only meaningful in the full table */}
        {level === 2 && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <SlidersHorizontal
                className="w-3.5 h-3.5 flex-shrink-0"
                strokeWidth={2.2}
                style={{ color: "var(--gmc-muted)" }}
                aria-hidden="true"
              />
              <span className="gmc-eyebrow">Jump to a section</span>
            </div>
            <FilterChips
              groups={groupList}
              activeGroups={activeGroups}
              onToggle={onToggleGroup}
              onClear={onClearGroups}
            />
            <div className="flex justify-end mt-3">
              <TrustLine data={data} />
            </div>
          </div>
        )}

        <motion.div layout={!reduce} transition={transition} className="mt-4 sm:mt-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={level}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={transition}
              data-testid={`level-content-${level}`}
            >
              {level === 0 && (
                <PriorityCards
                  features={features}
                  insurers={insurers}
                  lookup={lookup}
                  glossary={glossary}
                  intake={intake}
                  onOpenFeature={onOpenFeature}
                  onSeeAll={() => onLevelChange(2)}
                />
              )}
              {level === 1 && (
                <AtAGlance
                  features={features}
                  insurers={insurers}
                  lookup={lookup}
                  glossary={glossary}
                  notableCount={notableCount}
                  explanation={explanation}
                  highlightGroups={priorityGroups(intake)}
                  onOpen={onOpenFeature}
                  onOpenGroup={onOpenGroup}
                />
              )}
              {level === 2 && (
                <ComparisonTable
                  insurers={insurers}
                  features={features}
                  data={data}
                  glossary={glossary}
                  activeGroups={activeGroups}
                  openGroups={preOpenGroups}
                  flashFeature={flashFeature}
                  explanation={explanation}
                  onOpenFeature={onOpenFeature}
                  onClearFilters={onClearGroups}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
        </>)}
      </div>
    </section>
  );
}
