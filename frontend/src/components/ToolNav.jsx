import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Table2,
  MessageCircleQuestion,
  Share2,
  ChevronUp,
  PenLine,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import InsurerLogo from "@/components/InsurerLogo";
import InsurerPicker from "@/components/InsurerPicker";
import FilterChips from "@/components/FilterChips";
import useMediaQuery from "@/hooks/useMediaQuery";

/**
 * Two variants:
 *  - Desktop (≥1200px): floating right-side rail. Vertical dock of icon buttons.
 *    Each button shows its label on hover (label slides out to the left).
 *  - Below 1200px: mobile floating pill (bottom-right) that opens a bottom
 *    Sheet with the picker + filters.
 *
 * Both appear once the picker scrolls out of view. `onShare` is called for the
 * Share item; the parent decides between navigator.share and clipboard.
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
  onShare,
}) {
  const [visible, setVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const ticking = useRef(false);
  const isDesktop = useMediaQuery("(min-width: 1200px)");

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

  // Desktop right rail
  if (isDesktop) {
    return (
      <div
        className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
          visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6 pointer-events-none"
        }`}
        data-testid="tool-rail-desktop"
        aria-hidden={!visible}
      >
        <div
          className="flex flex-col gap-1.5 p-2 rounded-full"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid var(--gmc-line)",
            backdropFilter: "blur(14px)",
            boxShadow: "0 12px 40px rgba(22,28,39,0.10)",
          }}
        >
          <RailItem
            icon={Sparkles}
            label="At a glance"
            onClick={onScrollToGlance}
            testid="rail-glance"
          />
          <RailItem
            icon={Table2}
            label="Full comparison"
            onClick={onScrollToTable}
            testid="rail-table"
          />
          <RailItem
            icon={MessageCircleQuestion}
            label="Ask a question"
            onClick={onScrollToAsk}
            testid="rail-ask"
          />

          <div
            className="h-px my-1 mx-2"
            style={{ background: "var(--gmc-line)" }}
            aria-hidden="true"
          />

          {insurers.map((ins) => (
            <RailChip
              key={ins.id}
              insurer={ins}
              onClick={onScrollToPicker}
            />
          ))}
          <RailItem
            icon={PenLine}
            label="Change insurers"
            onClick={onScrollToPicker}
            testid="rail-change"
          />

          <div
            className="h-px my-1 mx-2"
            style={{ background: "var(--gmc-line)" }}
            aria-hidden="true"
          />

          <RailItem
            icon={Share2}
            label="Share this comparison"
            onClick={onShare}
            testid="rail-share"
          />
        </div>
      </div>
    );
  }

  // Mobile floating pill + sheet
  return (
    <>
      <button
        type="button"
        className={`fixed bottom-24 right-4 z-40 gmc-tap px-4 py-3 rounded-full text-white font-bold text-sm shadow-[0_10px_30px_rgba(20,181,175,0.4)] transition-all ${
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          className="bg-white rounded-t-[var(--gmc-r-card)] border-none max-h-[85vh] overflow-y-auto p-0"
          data-testid="mobile-tool-sheet"
        >
          <SheetHeader
            className="px-5 pt-5 pb-3 border-b"
            style={{ borderColor: "var(--gmc-line)" }}
          >
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

function RailItem({ icon: Icon, label, onClick, testid }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative gmc-tap flex items-center justify-center w-11 h-11 rounded-full transition-colors hover:bg-[color:var(--gmc-teal-tint)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gmc-teal)]"
      data-testid={testid}
      aria-label={label}
    >
      <Icon
        className="w-[18px] h-[18px]"
        strokeWidth={2.2}
        style={{ color: "var(--gmc-teal-deep)" }}
      />
      <span
        className="absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 rounded-full text-[12px] font-semibold opacity-0 -translate-x-1 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all"
        style={{
          background: "var(--gmc-ink)",
          color: "white",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function RailChip({ insurer, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative gmc-tap flex items-center justify-center w-11 h-11 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gmc-teal)]"
      title={`Change ${insurer.name}`}
      aria-label={`Change ${insurer.name}`}
      data-testid={`rail-chip-${insurer.id}`}
      style={{
        boxShadow: `inset 0 0 0 2px ${insurer.accent || "var(--gmc-teal)"}`,
      }}
    >
      <InsurerLogo insurer={insurer} size={26} />
      <span
        className="absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 rounded-full text-[12px] font-semibold opacity-0 -translate-x-1 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all"
        style={{ background: "var(--gmc-ink)", color: "white" }}
      >
{insurer.name}, change
      </span>
    </button>
  );
}
