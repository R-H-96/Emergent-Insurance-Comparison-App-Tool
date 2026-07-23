import { Pencil } from "lucide-react";
import InsurerMark from "@/components/InsurerMark";

/**
 * Slim strip at the top of the comparison surface: shows the currently
 * selected insurers as circular-mark + name chips. Change button sits
 * inline right after the last chip (inline with what it changes).
 *
 * Hidden on mobile — the InsurerPicker scroll strip above the surface
 * already shows the selection, and MobileBottomBar handles "change".
 */
export default function InsurerStrip({ insurers, onChange }) {
  return (
    <div
      className="hidden sm:flex flex-wrap items-center gap-3 py-3 mb-3"
      style={{ borderBottom: "1px solid var(--gmc-line)" }}
      data-testid="insurer-strip"
    >
      <span
        className="text-[11px] font-bold uppercase tracking-[0.1em]"
        style={{ color: "var(--gmc-muted)" }}
      >
        Comparing
      </span>
      {insurers.map((ins) => {
        const accent = ins.accent || "var(--gmc-teal)";
        return (
          <div
            key={ins.id}
            className="flex items-center gap-2 pl-1 pr-4 py-1 rounded-full"
            style={{
              background: "var(--gmc-teal-tint)",
              boxShadow: `inset 0 0 0 1.5px ${accent}, 0 4px 12px -8px ${accent}`,
            }}
            data-testid={`strip-chip-${ins.id}`}
          >
            <InsurerMark insurer={ins} size={28} />
            <span
              className="text-[13px] font-extrabold"
              style={{ color: accent }}
            >
              {ins.name}
            </span>
          </div>
        );
      })}
      <button
        type="button"
        className="gmc-btn-outline gmc-tap"
        onClick={onChange}
        data-testid="strip-change-btn"
      >
        <Pencil className="w-3.5 h-3.5" strokeWidth={2.2} />
        Change
      </button>
    </div>
  );
}
