import { Pencil, User, Users, UsersRound } from "lucide-react";
import InsurerMark from "@/components/InsurerMark";
import CoachMark from "@/components/CoachMark";
import {
  HOUSEHOLD_OPTIONS, PRIORITY_OPTIONS, intakeSummary,
} from "@/lib/personalisation";
import {
  Ribbon, Scissors, Stethoscope, Home, Hourglass, Award,
} from "lucide-react";

const HH_ICONS = { solo: User, couple: Users, family: UsersRound };
const PRI_ICONS = {
  ribbon: Ribbon, scissors: Scissors, stethoscope: Stethoscope,
  home: Home, hourglass: Hourglass, award: Award,
};

/**
 * "Here's what we're showing you and why", compressed.
 *
 * On a phone the spelled-out version ran to four stacked rows before any
 * content appeared. Everything that can be carried by a recognisable icon now
 * is: household as one, two or three figures, priorities as their subject
 * icons, insurers as their circular marks with no names. The full sentence
 * lives behind the info button, so nothing is lost, it just isn't spending
 * vertical space by default.
 *
 * Every chip stays tappable and still reopens the step it came from.
 */
export default function ReceiptBar({ intake, insurers, onEditIntake, onEditInsurers, coach = false }) {
  const bits = intakeSummary(intake);
  const personalised = bits.length > 0;
  const HouseholdIcon = HH_ICONS[intake?.household];
  const household = HOUSEHOLD_OPTIONS.find((h) => h.id === intake?.household);
  const priorities = (intake?.priorities || [])
    .map((id) => PRIORITY_OPTIONS.find((o) => o.id === id))
    .filter(Boolean);

  const chip = "gmc-tap inline-flex items-center gap-1.5 rounded-full transition-colors";
  const chipStyle = {
    background: "white",
    border: "1px solid rgba(20,181,175,0.4)",
    color: "var(--gmc-teal-deep)",
  };

  return (
    <div
      className="relative flex flex-wrap items-center gap-2 px-3 py-2.5 mb-3 rounded-[var(--gmc-r-ctl)]"
      style={{
        background: personalised ? "var(--gmc-teal-tint)" : "var(--gmc-bg-alt)",
        border: "1px solid var(--gmc-line)",
      }}
      data-testid="receipt-bar"
    >
      <CoachMark id="picker" show={coach}>
        Click here to change your comparison
      </CoachMark>

      <span
        className="hidden sm:inline-flex items-center gap-1.5 gmc-t-xs gmc-w-strong uppercase tracking-[0.08em] flex-shrink-0"
        style={{ color: "var(--gmc-muted)" }}
      >
        Comparing
      </span>

      {/* Insurers: marks only, names live in the info panel */}
      <button
        type="button"
        onClick={onEditInsurers}
        className={`${chip} pl-1 pr-2 py-1`}
        style={{ background: "white", border: "1px solid var(--gmc-line)" }}
        aria-label={`Comparing ${insurers.map((i) => i.name).join(", ")}. Change insurers`}
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
              <InsurerMark insurer={ins} size={24} />
            </span>
          ))}
        </span>
        <Pencil className="w-3 h-3 flex-shrink-0" strokeWidth={2.2} style={{ color: "var(--gmc-teal-mid)" }} aria-hidden="true" />
      </button>

      {/* Household as a figure count */}
      {HouseholdIcon && (
        <button
          type="button"
          onClick={onEditIntake}
          className={`${chip} px-2 py-1.5`}
          style={chipStyle}
          aria-label={`Cover for: ${household?.label}. Change`}
          data-testid="receipt-chip-household"
        >
          <HouseholdIcon className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
          <span className="hidden sm:inline gmc-t-sm gmc-w-strong">{household?.label}</span>
        </button>
      )}

      {/* Priorities as their subject icons */}
      {priorities.length > 0 && (
        <button
          type="button"
          onClick={onEditIntake}
          className={`${chip} px-2 py-1.5`}
          style={chipStyle}
          aria-label={`Showing first: ${priorities.map((p) => p.label).join(", ")}. Change`}
          data-testid="receipt-chip-priorities"
        >
          {priorities.map((p) => {
            const Icon = PRI_ICONS[p.icon];
            return Icon ? <Icon key={p.id} className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" /> : null;
          })}
          <span className="hidden lg:inline gmc-t-sm gmc-w-strong">first</span>
        </button>
      )}

      {/* Reading level stays as words: no icon reads as "explained simply" */}
      {intake?.knowledge && (
        <button
          type="button"
          onClick={onEditIntake}
          className={`${chip} px-2.5 py-1.5 gmc-t-sm gmc-w-strong`}
          style={chipStyle}
          data-testid="receipt-chip-knowledge"
        >
          {intake.knowledge === "informed" ? "Full detail" : "Explained simply"}
        </button>
      )}

      {!personalised && (
        <button
          type="button"
          onClick={onEditIntake}
          className={`${chip} px-2.5 py-1.5 gmc-t-sm gmc-w-strong`}
          style={chipStyle}
          data-testid="receipt-personalise"
        >
          Personalise this
        </button>
      )}

    </div>
  );
}
