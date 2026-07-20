import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Users, Filter, MessageCircleQuestion, Share2 } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import InsurerLogo from "@/components/InsurerLogo";
import ProductTypeSelector from "@/components/ProductTypeSelector";
import InsurerPicker from "@/components/InsurerPicker";
import FilterChips from "@/components/FilterChips";

/**
 * Desktop-only right rail (>= 1200px). A control dock, no anchor links.
 * Icons/logos only — every element exposes its label via a hover tooltip.
 * Below 1200px this renders nothing — the MobileBottomBar takes over.
 */
export default function ControlDock({
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
  askOpen,
  onToggleAsk,
  onShare,
  pickerOpen,
  onPickerOpenChange,
}) {
  const isDesktop = useMediaQuery("(min-width: 1200px)");
  const [filterOpen, setFilterOpen] = useState(false);

  if (!isDesktop) return null;

  return (
    <div
      className="fixed right-4 top-1/2 -translate-y-1/2 z-[60]"
      data-testid="control-dock"
    >
      <div
        className="flex flex-col gap-2 p-2.5 rounded-full"
        style={{
          background: "rgba(255,255,255,0.92)",
          border: "1px solid var(--gmc-line)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 12px 40px rgba(22,28,39,0.10)",
        }}
      >
        {/* Insurer picker trigger */}
        <Popover open={pickerOpen} onOpenChange={onPickerOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="group relative gmc-tap flex items-center justify-center w-14 h-14 rounded-full transition-colors hover:bg-[color:var(--gmc-teal-tint)]"
              data-testid="dock-insurers"
              aria-label="Change insurers"
            >
              <Users
                className="w-6 h-6"
                strokeWidth={2.2}
                style={{ color: "var(--gmc-teal-deep)" }}
              />
              <RailLabel>Change insurers</RailLabel>
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="center"
            sideOffset={12}
            className="w-[600px] max-w-[92vw] max-h-[80vh] overflow-y-auto p-6 bg-white rounded-[var(--gmc-r-card)] border shadow-[0_20px_60px_rgba(22,28,39,0.16)] z-[70]"
            style={{ borderColor: "var(--gmc-line)" }}
            data-testid="dock-picker-popover"
          >
            <div className="space-y-6">
              <ProductTypeSelector value={productType} onChange={onProductType} />
              <InsurerPicker
                insurers={allInsurers}
                selected={insurers.map((i) => i.id)}
                onToggle={onToggleInsurer}
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Individual insurer chips — logo only, larger */}
        {insurers.map((ins) => (
          <button
            key={ins.id}
            type="button"
            onClick={() => onPickerOpenChange(true)}
            className="group relative gmc-tap flex items-center justify-center w-14 h-14 rounded-full bg-white"
            style={{ boxShadow: `inset 0 0 0 2px ${ins.accent || "var(--gmc-teal)"}` }}
            aria-label={`${ins.name} — change insurer`}
            data-testid={`dock-chip-${ins.id}`}
          >
            <InsurerLogo insurer={ins} size={34} />
            <RailLabel>{ins.name}</RailLabel>
          </button>
        ))}

        <div className="h-px my-1 mx-3" style={{ background: "var(--gmc-line)" }} />

        {/* Filter popover */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="group relative gmc-tap flex items-center justify-center w-14 h-14 rounded-full transition-colors hover:bg-[color:var(--gmc-teal-tint)]"
              data-testid="dock-filter"
              aria-label="Filter groups"
              aria-expanded={filterOpen}
            >
              <Filter
                className="w-6 h-6"
                strokeWidth={2.2}
                style={{ color: "var(--gmc-teal-deep)" }}
              />
              <RailLabel>Filters</RailLabel>
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="left"
            align="center"
            sideOffset={12}
            className="w-[380px] max-h-[80vh] overflow-y-auto p-5 bg-white rounded-[var(--gmc-r-card)] border shadow-[0_20px_60px_rgba(22,28,39,0.16)] z-[70]"
            style={{ borderColor: "var(--gmc-line)" }}
            data-testid="dock-filter-popover"
          >
            <div className="gmc-eyebrow mb-3">Filter by group</div>
            <FilterChips
              groups={groups}
              activeGroups={activeGroups}
              onToggle={onToggleGroup}
              onClear={onClearGroups}
              filled
            />
            <div
              className="mt-5 pt-4 border-t flex items-center justify-between"
              style={{ borderColor: "var(--gmc-line)" }}
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
                aria-label="Toggle notable only"
                data-testid="dock-diff-toggle"
              />
            </div>
          </PopoverContent>
        </Popover>

        {/* Ask panel toggle */}
        <button
          type="button"
          onClick={onToggleAsk}
          className="group relative gmc-tap flex items-center justify-center w-14 h-14 rounded-full transition-colors hover:bg-[color:var(--gmc-teal-tint)]"
          style={{
            background: askOpen ? "var(--gmc-teal-tint)" : "transparent",
          }}
          data-testid="dock-ask"
          aria-label="Ask a question"
          aria-pressed={askOpen}
        >
          <MessageCircleQuestion
            className="w-6 h-6"
            strokeWidth={2.2}
            style={{ color: "var(--gmc-teal-deep)" }}
          />
          <RailLabel>Ask a question</RailLabel>
        </button>

        <div className="h-px my-1 mx-3" style={{ background: "var(--gmc-line)" }} />

        {/* Share */}
        <button
          type="button"
          onClick={onShare}
          className="group relative gmc-tap flex items-center justify-center w-14 h-14 rounded-full transition-colors hover:bg-[color:var(--gmc-teal-tint)]"
          data-testid="dock-share"
          aria-label="Share this comparison"
        >
          <Share2
            className="w-6 h-6"
            strokeWidth={2.2}
            style={{ color: "var(--gmc-teal-deep)" }}
          />
          <RailLabel>Share link</RailLabel>
        </button>
      </div>
    </div>
  );
}

function RailLabel({ children }) {
  return (
    <span
      className="absolute right-full mr-3 whitespace-nowrap px-3 py-1.5 rounded-full text-[12px] font-semibold opacity-0 -translate-x-1 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0 transition-all"
      style={{ background: "var(--gmc-ink)", color: "white" }}
    >
      {children}
    </span>
  );
}
