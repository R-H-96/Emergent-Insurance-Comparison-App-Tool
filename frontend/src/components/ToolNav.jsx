import { useEffect, useRef, useState } from "react";
import InsurerLogo from "@/components/InsurerLogo";
import { Sparkles, Table2, MessageCircleQuestion, ChevronUp } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import InsurerPicker from "@/components/InsurerPicker";
import FilterChips from "@/components/FilterChips";

/**
 * Sticky tool nav that appears once the user has scrolled past the picker.
 *
 * Desktop (>= md): compact horizontal bar with three anchor tabs (At a glance,
 * Full comparison, Ask a question), plus the selected-insurer logo chips and
 * a "Change" button that scrolls back to the picker.
 *
 * Mobile (< md): a floating pill at the bottom-right; tapping it opens a
 * bottom sheet containing the InsurerPicker + group FilterChips.
 */
export default function ToolNav({
  insurers,
  allInsurers,
  onToggleInsurer,
  groups,
  activeGroups,
  onToggleGroup,
  onClearGroups,
  onScrollToPicker,
  onScrollToTable,
  onScrollToGlance,
  onScrollToAsk,
}) {
  const [visible, setVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const ticking = useRef(false);

  // Show the sticky bar once the picker has scrolled out of view
  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const picker = document.querySelector(
          "[data-testid=insurer-picker-section]",
        );
        if (picker) {
          const rect = picker.getBoundingClientRect();
          setVisible(rect.bottom < 40);
        }
        ticking.current = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Desktop sticky bar */}
      <div
        className={`hidden md:block fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
        data-testid="tool-nav-desktop"
        style={{ pointerEvents: visible ? "auto" : "none" }}
      >
        <div className="gmc-nav">
          <div className="gmc-container flex items-center justify-between h-14 gap-4">
            <nav className="flex items-center gap-1">
              <button
                type="button"
                className="gmc-chip gmc-tap"
                onClick={onScrollToGlance}
                data-testid="tool-nav-glance"
              >
                <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} />
                At a glance
              </button>
              <button
                type="button"
                className="gmc-chip gmc-tap"
                onClick={onScrollToTable}
                data-testid="tool-nav-table"
              >
                <Table2 className="w-3.5 h-3.5" strokeWidth={2.2} />
                Full comparison
              </button>
              <button
                type="button"
                className="gmc-chip gmc-tap"
                onClick={onScrollToAsk}
                data-testid="tool-nav-ask"
              >
                <MessageCircleQuestion
                  className="w-3.5 h-3.5"
                  strokeWidth={2.2}
                />
                Ask a question
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <div className="flex items-center -space-x-2">
                {insurers.map((ins) => (
                  <div
                    key={ins.id}
                    style={{
                      boxShadow: `0 0 0 2px white, 0 0 0 3px ${ins.accent || "var(--gmc-teal)"}`,
                      borderRadius: 10,
                    }}
                    title={ins.name}
                  >
                    <InsurerLogo insurer={ins} size={24} />
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="gmc-btn-secondary gmc-tap"
                onClick={onScrollToPicker}
                data-testid="tool-nav-change"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile floating pill */}
      <button
        type="button"
        className={`md:hidden fixed bottom-24 right-4 z-40 gmc-tap px-4 py-3 rounded-full text-white font-bold text-sm shadow-[0_10px_30px_rgba(20,181,175,0.4)] transition-all ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-4"
        }`}
        style={{ background: "var(--gmc-grad-button)" }}
        onClick={() => setSheetOpen(true)}
        data-testid="mobile-tool-pill"
        aria-label="Change insurers and filters"
      >
        <span className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {insurers.slice(0, 3).map((ins) => (
              <InsurerLogo key={ins.id} insurer={ins} size={20} />
            ))}
          </div>
          <ChevronUp className="w-4 h-4" strokeWidth={2.5} />
        </span>
      </button>

      {/* Mobile bottom sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="bg-white rounded-t-[var(--gmc-r-card)] border-none max-h-[85vh] overflow-y-auto p-0"
          data-testid="mobile-tool-sheet"
        >
          <SheetHeader className="px-5 pt-5 pb-3 border-b" style={{ borderColor: "var(--gmc-line)" }}>
            <SheetTitle
              className="text-left text-lg font-extrabold"
              style={{ color: "var(--gmc-ink)" }}
            >
              Change what you&apos;re comparing
            </SheetTitle>
          </SheetHeader>
          <div className="p-5 space-y-6">
            <InsurerPicker
              insurers={allInsurers}
              selected={insurers.map((i) => i.id)}
              onToggle={onToggleInsurer}
            />
            <div>
              <div className="gmc-eyebrow mb-2">Filter by group</div>
              <FilterChips
                groups={groups}
                activeGroups={activeGroups}
                onToggle={onToggleGroup}
                onClear={onClearGroups}
              />
            </div>
            <button
              type="button"
              className="gmc-btn-primary w-full gmc-tap"
              onClick={() => setSheetOpen(false)}
              data-testid="mobile-sheet-done"
            >
              Done
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
