import InsurerLogo from "@/components/InsurerLogo";
import { Pencil } from "lucide-react";

/**
 * Slim strip at the top of the comparison surface — always shows the
 * currently selected insurers with a "Change" button that opens the picker
 * popover (no scrolling / anchor navigation).
 */
export default function InsurerStrip({ insurers, onChange }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 py-3 mb-3"
      style={{
        borderBottom: "1px solid var(--gmc-line)",
      }}
      data-testid="insurer-strip"
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.1em]"
          style={{ color: "var(--gmc-muted)" }}
        >
          Comparing
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {insurers.map((ins) => (
            <div
              key={ins.id}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-white border"
              style={{
                borderColor: "var(--gmc-line)",
                boxShadow: `inset 3px 0 0 ${ins.accent || "var(--gmc-teal)"}`,
              }}
              data-testid={`strip-chip-${ins.id}`}
            >
              <InsurerLogo insurer={ins} size={22} />
              <span
                className="text-[12px] font-bold"
                style={{ color: ins.accent || "var(--gmc-ink)" }}
              >
                {ins.name}
              </span>
            </div>
          ))}
        </div>
      </div>
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
