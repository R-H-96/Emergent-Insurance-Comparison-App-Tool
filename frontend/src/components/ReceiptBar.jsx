import { Pencil, Sparkles, Info, User, Users, UsersRound, Share2, Printer } from "lucide-react";
import InsurerMark from "@/components/InsurerMark";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  HOUSEHOLD_OPTIONS, PRIORITY_OPTIONS, KNOWLEDGE_OPTIONS, intakeSummary,
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
export default function ReceiptBar({ intake, insurers, onEditIntake, onEditInsurers, onShare, onPrint }) {
  const bits = intakeSummary(intake);
  const personalised = bits.length > 0;
  const HouseholdIcon = HH_ICONS[intake?.household];
  const household = HOUSEHOLD_OPTIONS.find((h) => h.id === intake?.household);
  const knowledge = KNOWLEDGE_OPTIONS.find((k) => k.id === intake?.knowledge);
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
      className="flex flex-wrap items-center gap-1.5 sm:gap-2 px-2.5 py-2 mb-3 rounded-[var(--gmc-r-ctl)]"
      style={{
        background: personalised ? "var(--gmc-teal-tint)" : "var(--gmc-bg-alt)",
        border: "1px solid var(--gmc-line)",
      }}
      data-testid="receipt-bar"
    >
      <span
        className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] flex-shrink-0"
        style={{ color: "var(--gmc-muted)" }}
      >
        {personalised && (
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: "var(--gmc-teal)" }} aria-hidden="true" />
        )}
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
          <span className="hidden sm:inline text-[12px] font-bold">{household?.label}</span>
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
          <span className="hidden lg:inline text-[12px] font-bold">first</span>
        </button>
      )}

      {/* Reading level stays as words: no icon reads as "explained simply" */}
      {knowledge && (
        <button
          type="button"
          onClick={onEditIntake}
          className={`${chip} px-2.5 py-1.5 text-[12px] font-bold`}
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
          className={`${chip} px-2.5 py-1.5 text-[12px] font-bold`}
          style={chipStyle}
          data-testid="receipt-personalise"
        >
          <Sparkles className="w-3 h-3" strokeWidth={2.2} aria-hidden="true" />
          Personalise this
        </button>
      )}

      {/* The full sentence, on demand */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="gmc-tap ml-auto flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0"
            style={{ background: "white", border: "1px solid var(--gmc-line)" }}
            aria-label="What am I looking at?"
            data-testid="receipt-info"
          >
            <Info className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: "var(--gmc-teal-mid)" }} />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-72 bg-white border rounded-[14px] p-4 shadow-[0_12px_40px_rgba(22,28,39,0.12)]"
          style={{ borderColor: "var(--gmc-line)" }}
          side="bottom"
          align="end"
          data-testid="receipt-info-popover"
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--gmc-teal-mid)" }}>
            What you're looking at
          </div>
          <dl className="space-y-2 text-[12.5px]" style={{ color: "var(--gmc-body)" }}>
            <div>
              <dt className="font-extrabold" style={{ color: "var(--gmc-ink)" }}>Comparing</dt>
              <dd>{insurers.map((i) => `${i.name} (${i.product})`).join(", ")}</dd>
            </div>
            {household && (
              <div>
                <dt className="font-extrabold" style={{ color: "var(--gmc-ink)" }}>Cover for</dt>
                <dd>{household.label}. {household.blurb}</dd>
              </div>
            )}
            {priorities.length > 0 && (
              <div>
                <dt className="font-extrabold" style={{ color: "var(--gmc-ink)" }}>Shown first</dt>
                <dd>{priorities.map((p) => p.label).join(", ")}</dd>
              </div>
            )}
            {knowledge && (
              <div>
                <dt className="font-extrabold" style={{ color: "var(--gmc-ink)" }}>Reading level</dt>
                <dd>{knowledge.label}. {knowledge.blurb}</dd>
              </div>
            )}
          </dl>
          <button
            type="button"
            onClick={onEditIntake}
            className="gmc-btn-outline gmc-tap w-full mt-3"
            data-testid="receipt-info-edit"
          >
            Change any of this
          </button>
          <div className="flex gap-2 mt-2 lg:hidden">
            <button
              type="button"
              onClick={onShare}
              className="gmc-btn-outline gmc-tap flex-1"
              data-testid="receipt-share"
            >
              <Share2 className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
              Share
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="gmc-btn-outline gmc-tap flex-1"
              data-testid="receipt-print"
            >
              <Printer className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
              Save
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
