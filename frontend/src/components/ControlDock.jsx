import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, Users, Filter, Share2 } from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import InsurerMark from "@/components/InsurerMark";
import ProductTypeSelector from "@/components/ProductTypeSelector";
import FilterChips from "@/components/FilterChips";

/**
 * Desktop-only right rail (>= 1200px). Three actions only: change
 * insurers, filter, share. The Ask launcher is a separate bottom-right
 * chat bubble (see AskLaunchBubble). Rail chips use circular marks; the
 * insurer popover renders lean picker cards (mark + name + product,
 * no version line) so five cards fit on one row without word-breaking.
 *
 * Toggle behaviour: clicking the icon/chip while its popover is open
 * closes it. Click-away close still applies.
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
        <Popover open={pickerOpen} onOpenChange={onPickerOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={() => onPickerOpenChange(!pickerOpen)}
              className="group relative gmc-tap flex items-center justify-center w-14 h-14 rounded-full transition-colors hover:bg-[color:var(--gmc-teal-tint)]"
              data-testid="dock-insurers"
              aria-label="Change insurers"
              aria-expanded={pickerOpen}
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
            align="start"
            sideOffset={12}
            avoidCollisions={false}
            collisionPadding={16}
            className="p-6 bg-white rounded-[var(--gmc-r-card)] border shadow-[0_20px_60px_rgba(22,28,39,0.16)] z-[70]"
            style={{
              borderColor: "var(--gmc-line)",
              width: "min(88vw, 880px)",
              maxHeight: "calc(100vh - 32px)",
              overflowY: "auto",
              marginTop: 16,
            }}
            data-testid="dock-picker-popover"
          >
            <div className="space-y-5">
              <ProductTypeSelector value={productType} onChange={onProductType} />
              <RailPickerGrid
                insurers={allInsurers}
                selected={insurers.map((i) => i.id)}
                onToggle={onToggleInsurer}
              />
            </div>
          </PopoverContent>
        </Popover>

        {insurers.map((ins) => (
          <button
            key={ins.id}
            type="button"
            onClick={() => onPickerOpenChange(!pickerOpen)}
            className="group relative gmc-tap flex items-center justify-center w-14 h-14 rounded-full"
            style={{ boxShadow: `inset 0 0 0 2px ${ins.accent || "var(--gmc-teal)"}` }}
            aria-label={`${ins.name} — change insurer`}
            data-testid={`dock-chip-${ins.id}`}
          >
            <InsurerMark insurer={ins} size={40} />
            <RailLabel>{ins.name}</RailLabel>
          </button>
        ))}

        <div className="h-px my-1 mx-3" style={{ background: "var(--gmc-line)" }} />

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              onClick={() => setFilterOpen(!filterOpen)}
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

/**
 * Compact picker used only inside the rail popover. Lean cards: circular
 * mark + insurer name + product name. Version line is intentionally
 * omitted here (still visible in the main InsurerPicker used elsewhere).
 * Fixed 5-column grid so the layout matches the main picker.
 */
function RailPickerGrid({ insurers, selected, onToggle }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 mb-3">
        <div className="gmc-eyebrow">Choose insurers</div>
        <div
          className="text-xs font-semibold"
          style={{ color: "var(--gmc-muted)" }}
          data-testid="rail-picker-count"
        >
          {selected.length} of 3 selected
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {insurers.map((ins) => {
          const isSel = selected.includes(ins.id);
          const disabled = !isSel && selected.length >= 3;
          const accent = ins.accent || "var(--gmc-teal)";
          return (
            <button
              key={ins.id}
              type="button"
              onClick={() => onToggle(ins.id)}
              aria-pressed={isSel}
              disabled={disabled}
              className={`text-left p-3 rounded-[var(--gmc-r-ctl)] border-[1.5px] transition-all bg-white hover:-translate-y-0.5 ${
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                borderColor: isSel ? accent : "var(--gmc-line-soft)",
                background: isSel ? "var(--gmc-teal-tint)" : "white",
                boxShadow: isSel ? `0 6px 20px -12px ${accent}` : "none",
              }}
              data-testid={`rail-insurer-${ins.id}`}
            >
              <div className="flex items-center justify-between gap-2">
                <InsurerMark insurer={ins} size={36} />
                {isSel && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: accent }}
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div
                className="mt-3 font-extrabold text-[14px] leading-tight break-normal"
                style={{ color: isSel ? accent : "var(--gmc-ink)" }}
              >
                {ins.name}
              </div>
              <div
                className="mt-1 text-[12px] font-semibold leading-snug"
                style={{ color: "var(--gmc-muted)" }}
              >
                {ins.product}
              </div>
            </button>
          );
        })}
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
