import { Check } from "lucide-react";
import InsurerMark from "@/components/InsurerMark";
import SourceLink from "@/components/SourceLink";

export default function InsurerPicker({ insurers, selected, onToggle, compact = false }) {
  return (
    <div data-testid="insurer-picker">
      <div className="flex items-baseline justify-between gap-4 flex-wrap mb-4">
        <div>
          <div className="gmc-eyebrow mb-2">Choose insurers</div>
          {!compact && (
            <h2 className="gmc-h2 text-2xl sm:text-3xl">Pick 2 or 3 to compare</h2>
          )}
        </div>
        <div
          className="text-xs gmc-w-strong"
          style={{ color: "var(--gmc-muted)" }}
          data-testid="insurer-count"
        >
          {selected.length} of 3 selected
        </div>
      </div>

      {/* Mobile: horizontal scroll strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 sm:hidden snap-x snap-mandatory thin-scrollbar -mx-1 px-1">
        {insurers.map((ins) => {
          const isSelected = selected.includes(ins.id);
          const disabled = !isSelected && selected.length >= 3;
          const accent = ins.accent || "var(--gmc-teal)";
          return (
            <button
              key={ins.id}
              type="button"
              onClick={() => onToggle(ins.id)}
              aria-pressed={isSelected}
              disabled={disabled}
              className="snap-start flex-shrink-0 flex flex-col items-center gap-2 pt-3 pb-2.5 px-3 w-[96px] rounded-[var(--gmc-r-ctl)] border-[1.5px] transition-all"
              style={{
                borderColor: isSelected ? accent : "var(--gmc-line-soft)",
                background: isSelected ? "var(--gmc-teal-tint-2)" : "white",
                boxShadow: isSelected ? `inset 0 0 0 2px ${accent}` : "none",
                opacity: disabled ? 0.5 : 1,
              }}
              data-testid={`insurer-${ins.id}`}
            >
              <div className="relative">
                <InsurerMark insurer={ins} size={40} />
                {isSelected && (
                  <div
                    className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full flex items-center justify-center"
                    style={{ background: accent }}
                  >
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div
                className="gmc-t-sm gmc-w-strong text-center leading-tight w-full"
                style={{ color: isSelected ? accent : "var(--gmc-ink)" }}
              >
                {ins.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tablet / desktop: card grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-3 items-stretch">
        {insurers.map((ins) => {
          const isSelected = selected.includes(ins.id);
          const disabled = !isSelected && selected.length >= 3;
          const accent = ins.accent || "var(--gmc-teal)";
          return (
            <div
              key={ins.id}
              role="button"
              tabIndex={disabled ? -1 : 0}
              onClick={() => !disabled && onToggle(ins.id)}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(ins.id); }
              }}
              aria-pressed={isSelected}
              aria-disabled={disabled}
              className={`flex flex-col text-left p-4 rounded-[var(--gmc-r-ctl)] border-[1.5px] transition-all bg-white hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gmc-teal)] ${
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                borderColor: isSelected ? accent : "var(--gmc-line-soft)",
                background: isSelected ? "var(--gmc-teal-tint-2)" : "white",
                boxShadow: isSelected
                  ? `inset 0 0 0 2px ${accent}, 0 6px 20px -12px ${accent}`
                  : "none",
              }}
              data-testid={`insurer-${ins.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <InsurerMark insurer={ins} size={40} />
                {isSelected && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: accent }}
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div
                className="mt-3 gmc-w-heavy gmc-t-md leading-tight"
                style={{ color: isSelected ? accent : "var(--gmc-ink)" }}
              >
                {ins.name}
              </div>
              <div
                className="mt-1 text-xs gmc-w-strong"
                style={{ color: "var(--gmc-muted)" }}
              >
                {ins.product}
              </div>
              <div className="mt-auto pt-2">
                <SourceLink insurer={ins} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
