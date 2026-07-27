import { useState } from "react";
import { Info, ChevronDown } from "lucide-react";
import GlossaryText from "@/components/GlossaryText";

/**
 * "Why this matters" affordance — the single, consistent tap-to-reveal
 * pattern used across the tool (priority cards, table rows, detail modal).
 *
 * Renders the `why` field from gmc_tool_data.json, which is plain-English
 * context written for someone new to insurance. `why` strings may contain
 * {glossary} markers, so the body goes through GlossaryText.
 *
 * Two modes:
 *   inline    — always expanded, teal-tinted panel with a left rule.
 *               Used for readers who told us they're new to this.
 *   collapsed — a small pill button that expands on tap.
 *               Used for confident readers and in dense views.
 */
export default function WhyReveal({
  why,
  glossary,
  inline = false,
  className = "",
  testId = "why-reveal",
}) {
  const [open, setOpen] = useState(false);
  if (!why) return null;

  const Panel = (
    <div
      className="flex gap-2 px-3 py-2.5"
      style={{
        background: "var(--gmc-teal-tint)",
        borderLeft: "3px solid var(--gmc-teal)",
      }}
      data-testid={`${testId}-panel`}
    >
      <Info
        className="w-4 h-4 flex-shrink-0 mt-0.5"
        strokeWidth={2.2}
        style={{ color: "var(--gmc-teal-mid)" }}
        aria-hidden="true"
      />
      <GlossaryText
        tag="div"
        text={why}
        glossary={glossary}
        className="text-[12.5px] leading-relaxed"
      />
    </div>
  );

  if (inline) {
    return <div className={`mt-2.5 overflow-hidden ${className}`}>{Panel}</div>;
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-bold transition-colors"
        style={{
          border: "1px solid var(--gmc-line)",
          background: open ? "var(--gmc-teal-tint)" : "white",
          color: "var(--gmc-teal-deep)",
        }}
        data-testid={`${testId}-toggle`}
      >
        <Info className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
        Why this matters
        <ChevronDown
          className="w-3 h-3 transition-transform"
          strokeWidth={2.5}
          style={{ transform: open ? "rotate(180deg)" : "none" }}
          aria-hidden="true"
        />
      </button>
      {open && <div className="mt-2">{Panel}</div>}
    </div>
  );
}
