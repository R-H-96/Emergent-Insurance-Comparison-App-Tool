import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageCircleQuestion, Users } from "lucide-react";
import MobileSheet from "@/components/MobileSheet";
import { AskPanelBody } from "@/components/AskPanel";
import ProductTypeSelector from "@/components/ProductTypeSelector";
import InsurerPicker from "@/components/InsurerPicker";
import FilterChips from "@/components/FilterChips";

/**
 * Mobile-only floating action button (below xl breakpoint).
 * Combines Ask + Compare into a single bottom sheet with two tabs.
 * Replaces the old compact ask bar and bottom bar on mobile.
 *
 * Tab bar lives in MobileSheet's headerExtra slot (non-scrollable) so the
 * drag handle above it always works for swipe-to-dismiss, and the body
 * scroll is fully independent of the tabs.
 */
export default function MobileFAB({
  // Ask
  askState,
  examples,
  insurers,
  lookup,
  glossary,
  onLocate,
  onOpenFeature,
  // Compare
  allInsurers,
  onToggleInsurer,
  productType,
  onProductType,
  groups,
  activeGroups,
  onToggleGroup,
  onClearGroups,
  notableCount,
  // Control
  hidden = false,
  compareOpen,
  onCompareOpenChange,
}) {
  const reduce = useReducedMotion();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("ask");

  useEffect(() => {
    if (compareOpen) {
      setActiveTab("compare");
      setSheetOpen(true);
    }
  }, [compareOpen]);

  const handleClose = () => {
    setSheetOpen(false);
    onCompareOpenChange?.(false);
  };

  const handleLocate = (featureName) => {
    handleClose();
    onLocate(featureName);
  };

  const handleOpenFeature = (featureName) => {
    handleClose();
    onOpenFeature(featureName);
  };

  // Tab bar rendered in MobileSheet's headerExtra slot (non-scrollable zone)
  const TabBar = (
    <div
      role="tablist"
      aria-label="Action tabs"
      className="flex border-b"
      style={{ borderColor: "var(--gmc-line)" }}
    >
      {[
        { id: "ask", label: "Ask", Icon: MessageCircleQuestion },
        { id: "compare", label: "Compare", Icon: Users },
      ].map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={activeTab === id}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 gmc-t-base gmc-w-strong transition-colors"
          style={{
            color: activeTab === id ? "var(--gmc-teal)" : "var(--gmc-muted)",
            borderBottom:
              activeTab === id
                ? "2.5px solid var(--gmc-teal)"
                : "2.5px solid transparent",
          }}
          onClick={() => setActiveTab(id)}
          data-testid={`fab-tab-${id}`}
        >
          <Icon className="w-4 h-4" strokeWidth={2.2} />
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* FAB button */}
      <AnimatePresence>
        {!hidden && !sheetOpen && (
          <motion.button
            type="button"
            className="fixed z-[60] xl:hidden print:hidden flex items-center justify-center w-14 h-14 rounded-full"
            style={{
              right: 16,
              bottom: "calc(env(safe-area-inset-bottom, 0px) + 20px)",
              background: "var(--gmc-teal)",
              boxShadow:"0 8px 28px rgba(20,181,175,0.45), 0 3px 8px rgba(22,28,39,0.18)",
            }}
            onClick={() => {
              setActiveTab("ask");
              setSheetOpen(true);
            }}
            initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            aria-label="Ask a question or change comparison"
            data-testid="mobile-fab"
          >
            <MessageCircleQuestion className="w-6 h-6 text-white" strokeWidth={2.2} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Unified sheet */}
      <MobileSheet
        open={sheetOpen}
        onClose={handleClose}
        testId="fab-sheet"
        headerExtra={TabBar}
        scrollKey={activeTab}
        maxHeight={activeTab === "compare" ? "min(74dvh, 620px)" : undefined}
        footer={
          activeTab === "compare" ? (
            <div className="p-4">
              <button
                type="button"
                className="gmc-btn-primary w-full gmc-tap"
                onClick={handleClose}
                data-testid="fab-sheet-done"
              >
                Done
              </button>
            </div>
          ) : null
        }
      >
        {/* Ask tab */}
        {activeTab === "ask" && (
          <AskPanelBody
            askState={askState}
            examples={examples}
            insurers={insurers}
            lookup={lookup}
            glossary={glossary}
            onLocate={handleLocate}
            onOpenFeature={handleOpenFeature}
          />
        )}

        {/* Compare tab */}
        {activeTab === "compare" && (
          <div className="p-4 space-y-4 pb-2">
            <ProductTypeSelector value={productType} onChange={onProductType} />
            <InsurerPicker
              insurers={allInsurers}
              selected={insurers.map((i) => i.id)}
              onToggle={onToggleInsurer}
              compact
            />
            <div>
              <div className="gmc-eyebrow mb-2">Jump to a section</div>
              <FilterChips
                groups={groups}
                activeGroups={activeGroups}
                onToggle={onToggleGroup}
                onClear={onClearGroups}
                filled
              />
            </div>
          </div>
        )}
      </MobileSheet>
    </>
  );
}
