import { Pencil, Sparkles } from "lucide-react";
import InsurerMark from "@/components/InsurerMark";
import { intakeSummary } from "@/lib/personalisation";

/**
 * Persistent "here's what we're showing you and why" bar.
 *
 * This is the payoff for the intake flow — without it the questions feel like
 * a toll gate. Every chip is tappable and re-opens the relevant step, so this
 * doubles as the way back into the intake without a separate screen.
 */
export default function ReceiptBar({ intake, insurers, onEditIntake, onEditInsurers }) {
  const bits = intakeSummary(intake);
  const personalised = bits.length > 0;

  return (
    <div
      className="flex flex-wrap items-center gap-2 px-3 py-2.5 mb-4 rounded-[var(--gmc-r-ctl)]"
      style={{
        background: personalised ? "var(--gmc-teal-tint)" : "var(--gmc-bg-alt)",
        border: "1px solid var(--gmc-line)",
      }}
      data-testid="receipt-bar"
    >
      <span
        className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] flex-shrink-0"
        style={{ color: "var(--gmc-muted)" }}
      >
        {personalised && (
          <Sparkles
            className="w-3.5 h-3.5"
            strokeWidth={2.2}
            style={{ color: "var(--gmc-teal)" }}
            aria-hidden="true"
          />
        )}
        Comparing
      </span>

      {/* Insurers — tap to change */}
      <button
        type="button"
        onClick={onEditInsurers}
        className="gmc-tap inline-flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition-colors"
        style={{ background: "white", border: "1px solid var(--gmc-line)" }}
        data-testid="receipt-insurers"
      >
        <span className="flex flex-shrink-0">
          {insurers.map((ins, i) => (
            <span
              key={ins.id}
              style={{
                marginLeft: i > 0 ? -8 : 0,
                boxShadow: "0 0 0 2px white",
                borderRadius: "50%",
                display: "flex",
                zIndex: insurers.length - i,
                position: "relative",
              }}
            >
              <InsurerMark insurer={ins} size={22} />
            </span>
          ))}
        </span>
        <span className="text-[12px] font-bold" style={{ color: "var(--gmc-ink)" }}>
          {insurers.map((i) => i.name).join(" vs ")}
        </span>
        <Pencil
          className="w-3 h-3 flex-shrink-0"
          strokeWidth={2.2}
          style={{ color: "var(--gmc-teal-mid)" }}
          aria-hidden="true"
        />
      </button>

      {/* Intake answers — tap to redo */}
      {bits.map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={onEditIntake}
          className="gmc-tap inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold transition-colors"
          style={{
            background: "white",
            border: "1px solid rgba(20,181,175,0.4)",
            color: "var(--gmc-teal-deep)",
          }}
          data-testid={`receipt-chip-${b.key}`}
        >
          {b.label}
          <Pencil className="w-3 h-3 flex-shrink-0" strokeWidth={2.2} aria-hidden="true" />
        </button>
      ))}

      {!personalised && (
        <button
          type="button"
          onClick={onEditIntake}
          className="gmc-tap inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold"
          style={{
            background: "white",
            border: "1px solid rgba(20,181,175,0.4)",
            color: "var(--gmc-teal-deep)",
          }}
          data-testid="receipt-personalise"
        >
          <Sparkles className="w-3 h-3" strokeWidth={2.2} aria-hidden="true" />
          Personalise this
        </button>
      )}
    </div>
  );
}
