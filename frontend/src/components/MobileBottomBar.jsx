import { useState } from "react";
import { Users, MessageCircleQuestion } from "lucide-react";
import MobileSheet from "@/components/MobileSheet";
import useMediaQuery from "@/hooks/useMediaQuery";
import ProductTypeSelector from "@/components/ProductTypeSelector";
import InsurerPicker from "@/components/InsurerPicker";
import FilterChips from "@/components/FilterChips";

/**
 * Mobile-only single bottom action bar (<1200px). Three slots:
 *   Compare (picker + filters sheet) · Ask · Adviser
 *
 * Hidden while another sheet is open (askOpen or featureOpen) so it doesn't
 * peek behind modal content. Safe-area-inset-bottom aware.
 */
export default function MobileBottomBar({
  insurers,
  allInsurers,
  onToggleInsurer,
  productType,
  onProductType,
  groups,
  activeGroups,
  onToggleGroup,
  onClearGroups,
  diffOnly,
  onDiffOnlyChange,
  notableCount,
  onOpenAsk,
  hidden = false,
}) {
  const isMobile = !useMediaQuery("(min-width: 1200px)");
  const [compareOpen, setCompareOpen] = useState(false);

  if (!isMobile) return null;

  const shouldHide = hidden || compareOpen;

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-30 flex gap-2 px-2 pt-2 print:hidden transition-transform duration-200 ease-out"
        style={{
          background: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--gmc-line)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
          transform: shouldHide ? "translateY(120%)" : "translateY(0)",
          visibility: shouldHide ? "hidden" : "visible",
        }}
        aria-hidden={shouldHide}
        data-testid="mobile-bottom-bar"
      >
        <button
          type="button"
          className="flex-1 gmc-tap flex flex-col items-center justify-center gap-0.5 rounded-[var(--gmc-r-ctl)] bg-white border py-2"
          style={{ borderColor: "var(--gmc-line-soft)" }}
          onClick={() => setCompareOpen(true)}
          data-testid="mbb-compare"
        >
          <Users className="w-4 h-4" style={{ color: "var(--gmc-teal-deep)" }} strokeWidth={2.2} />
          <span
            className="text-[11px] font-bold"
            style={{ color: "var(--gmc-ink)" }}
          >
            Compare
          </span>
        </button>
        <button
          type="button"
          className="flex-1 gmc-tap flex flex-col items-center justify-center gap-0.5 rounded-[var(--gmc-r-ctl)] bg-white border py-2"
          style={{ borderColor: "var(--gmc-line-soft)" }}
          onClick={onOpenAsk}
          data-testid="mbb-ask"
        >
          <MessageCircleQuestion className="w-4 h-4" style={{ color: "var(--gmc-teal-deep)" }} strokeWidth={2.2} />
          <span
            className="text-[11px] font-bold"
            style={{ color: "var(--gmc-ink)" }}
          >
            Ask
          </span>
        </button>
        <button
          type="button"
          className="flex-[1.4] gmc-tap flex items-center justify-center gap-1 rounded-[var(--gmc-r-ctl)] py-2 gmc-quote-trigger text-white font-bold text-[13px]"
          style={{ background: "var(--gmc-grad-button)" }}
          data-testid="mbb-adviser"
        >
          Adviser — free
        </button>
      </div>

      <MobileSheet
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        title="Change comparison"
        eyebrow="Compare"
        testId="mbb-compare-sheet"
        maxHeight="90vh"
        footer={
          <div className="p-4">
            <button
              type="button"
              className="gmc-btn-primary w-full gmc-tap"
              onClick={() => setCompareOpen(false)}
              data-testid="mbb-sheet-done"
            >
              Done
            </button>
          </div>
        }
      >
        <div className="p-5 space-y-6">
          <ProductTypeSelector value={productType} onChange={onProductType} />
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
              filled
            />
          </div>
          <div
            className="flex items-center justify-between p-3 rounded-[var(--gmc-r-ctl)]"
            style={{ background: "var(--gmc-bg-alt)" }}
          >
            <div>
              <div
                className="text-[14px] font-bold"
                style={{ color: "var(--gmc-ink)" }}
              >
                Notable only
              </div>
              <div
                className="text-[12px]"
                style={{ color: "var(--gmc-muted)" }}
              >
                {notableCount} for this pair
              </div>
            </div>
            <button
              type="button"
              className="gmc-toggle gmc-tap"
              aria-pressed={diffOnly}
              onClick={() => onDiffOnlyChange(!diffOnly)}
              data-testid="mbb-diff-toggle"
              aria-label="Toggle notable only"
            />
          </div>
        </div>
      </MobileSheet>
    </>
  );
}
