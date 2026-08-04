import { Info, Share2, Printer } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  HOUSEHOLD_OPTIONS, PRIORITY_OPTIONS, KNOWLEDGE_OPTIONS,
} from "@/lib/personalisation";

/**
 * "What am I looking at?" for the whole comparison.
 *
 * This used to live inside the receipt bar, but that bar wraps, so an
 * auto-margined button pushed itself onto a row of its own and left an empty
 * band across the top of the page on a phone. It belongs in the page header
 * instead, level with the heading, where it has somewhere to sit.
 *
 * Carries share and save as well, since those came out of the sticky ladder row
 * to give the three rungs their full width on small screens.
 */
export default function ComparisonInfo({ intake, insurers, onEditIntake, onShare, onPrint }) {
  const household = HOUSEHOLD_OPTIONS.find((h) => h.id === intake?.household);
  const knowledge = KNOWLEDGE_OPTIONS.find((k) => k.id === intake?.knowledge);
  const priorities = (intake?.priorities || [])
    .map((id) => PRIORITY_OPTIONS.find((o) => o.id === id))
    .filter(Boolean);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="gmc-tap flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 transition-colors hover:bg-[color:var(--gmc-teal-tint)]"
          style={{ background: "white", border: "1px solid var(--gmc-line)" }}
          aria-label="What am I looking at?"
          data-testid="comparison-info"
        >
          <Info className="w-4 h-4" strokeWidth={2.2} style={{ color: "var(--gmc-teal-mid)" }} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[min(20rem,calc(100vw-2rem))] bg-white border rounded-[var(--gmc-r-ctl)] p-4 shadow-[var(--gmc-shadow-float)]"
        style={{ borderColor: "var(--gmc-line)", zIndex: 95 }}
        side="bottom"
        align="end"
        collisionPadding={12}
        data-testid="comparison-info-popover"
      >
        <div
          className="gmc-t-xs gmc-w-strong uppercase tracking-[0.1em] mb-2"
          style={{ color: "var(--gmc-teal-mid)" }}
        >
          What you&apos;re looking at
        </div>
        <dl className="space-y-2.5 gmc-t-sm" style={{ color: "var(--gmc-body)" }}>
          <div>
            <dt className="gmc-w-heavy" style={{ color: "var(--gmc-ink)" }}>Comparing</dt>
            <dd>{insurers.map((i) => `${i.name} (${i.product})`).join(", ")}</dd>
          </div>
          {household && (
            <div>
              <dt className="gmc-w-heavy" style={{ color: "var(--gmc-ink)" }}>Cover for</dt>
              <dd>{household.label}. {household.blurb}</dd>
            </div>
          )}
          {priorities.length > 0 && (
            <div>
              <dt className="gmc-w-heavy" style={{ color: "var(--gmc-ink)" }}>Shown first</dt>
              <dd>{priorities.map((p) => p.label).join(", ")}</dd>
            </div>
          )}
          {knowledge && (
            <div>
              <dt className="gmc-w-heavy" style={{ color: "var(--gmc-ink)" }}>Reading level</dt>
              <dd>{knowledge.label}. {knowledge.blurb}</dd>
            </div>
          )}
        </dl>
        <button
          type="button"
          onClick={onEditIntake}
          className="gmc-btn-outline gmc-tap w-full mt-3"
          data-testid="comparison-info-edit"
        >
          Change any of this
        </button>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onShare}
            className="gmc-btn-outline gmc-tap flex-1"
            data-testid="comparison-info-share"
          >
            <Share2 className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
            Share
          </button>
          <button
            type="button"
            onClick={onPrint}
            className="gmc-btn-outline gmc-tap flex-1"
            data-testid="comparison-info-print"
          >
            <Printer className="w-3.5 h-3.5" strokeWidth={2.2} aria-hidden="true" />
            Save
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
