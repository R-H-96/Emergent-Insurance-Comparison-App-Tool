import { ChevronRight, Info, Lightbulb } from "lucide-react";
import FeatureIcon from "@/components/FeatureIcon";
import InsurerMark from "@/components/InsurerMark";
import GlossaryText from "@/components/GlossaryText";
import TierBadge from "@/components/TierBadge";
import MarkerInfo from "@/components/MarkerInfo";
import ProvenanceNote from "@/components/ProvenanceNote";
import InfoReveal from "@/components/InfoReveal";
import { groupLabel, featureTitle } from "@/lib/personalisation";
import { STATE_META, COVER_STATE } from "@/lib/gaps";

/**
 * One feature, one card. Used by both the priorities view and the differences
 * list, so the two cannot drift apart.
 *
 * Previously each card stacked five lines of framing before a single policy
 * value: group eyebrow, plain title, technical name, definition, and a
 * "why this matters" panel. Four of those say roughly the same thing in
 * decreasing usefulness, and the reader has to get through all of them to
 * reach the answer.
 *
 * Now: one title, and an info button holding everything else. The title swaps
 * to the technical name for readers who said they know the market, so nobody
 * gets both at once.
 */
export default function FeatureCard({
  feature, insurers, lookup, glossary, explanation,
  states, note, band, onOpen,
}) {
  const f = feature;
  const title = featureTitle(f, explanation);

  return (
    <div
      className="gmc-surface flex flex-col p-4 sm:p-5"
      data-testid={`feature-card-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onOpen(f.feature)}
          className="flex items-start gap-2.5 text-left flex-1 min-w-0"
          data-testid={`feature-open-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
        >
          <FeatureIcon name={f.feature} size={20} className="mt-0.5" />
          <span className="gmc-t-lg gmc-w-heavy leading-snug flex-1" style={{ color: "var(--gmc-ink)" }}>
            {title.primary}
          </span>
          <ChevronRight
            className="w-4 h-4 flex-shrink-0 mt-1.5"
            strokeWidth={2.2}
            style={{ color: "var(--gmc-muted)" }}
            aria-hidden="true"
          />
        </button>

        <InfoReveal
          eyebrow={groupLabel(f.group)}
          title={title.secondary || title.primary}
          testId={`about-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
          triggerClassName="gmc-tap flex items-center justify-center w-8 h-8 rounded-[var(--gmc-r-chip)] flex-shrink-0"
          triggerStyle={{ background: "var(--gmc-bg-alt)" }}
          ariaLabel={`About ${title.primary}`}
          body={
            <>
              {f.definition && (
                <p className="leading-relaxed">
                  <GlossaryText tag="span" text={f.definition} glossary={glossary} />
                </p>
              )}
              {f.why && (
                <p className="leading-relaxed mt-2.5 pt-2.5" style={{ borderTop: "1px solid var(--gmc-line)" }}>
                  <GlossaryText tag="span" text={f.why} glossary={glossary} />
                </p>
              )}
            </>
          }
        >
          <Info className="w-4 h-4" strokeWidth={2.2} style={{ color: "var(--gmc-teal-mid)" }} />
        </InfoReveal>
      </div>

      {note && (
        <div
          className="flex items-start gap-1.5 mt-2 gmc-t-xs gmc-w-strong"
          style={{ color: "var(--gmc-teal-deep)" }}
        >
          <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" strokeWidth={2.2} aria-hidden="true" />
          {note}
        </div>
      )}

      <div className="mt-3.5 flex-1">
        {insurers.map((ins, i) => {
          const entry = lookup[ins.id]?.[f.feature];
          const state = states ? states[i] : null;
          const meta = state ? STATE_META[state] : null;
          const flagged = state && state !== COVER_STATE.COVERED;
          const b = band ? band(ins.id, f.group) : null;
          return (
            /* Rung 0 and 1 share this row. Name and provenance are reference
               information and sit small above and below the value.
               No fill, no inner border: separation is space and one hairline,
               which is why the page underneath can be white. */
            <div
              key={ins.id}
              className="py-4 first:pt-0"
              style={{ borderTop: i === 0 ? "none" : "1px solid var(--gmc-line)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 gmc-t-sm min-w-0" style={{ color: "var(--gmc-muted)" }}>
                  <InsurerMark insurer={ins} size={20} />
                  <span className="truncate">{ins.name}</span>
                </span>
                {(flagged || b) && (
                  <span className="flex-shrink-0">
                    {flagged ? (
                      <MarkerInfo title={meta.label} label={meta.help}>
                        <span
                          className="inline-block rounded-[var(--gmc-r-chip)] px-2 py-0.5 gmc-t-xs gmc-w-strong whitespace-nowrap"
                          style={{ background: meta.fill, color: meta.text }}
                        >
                          {meta.label}
                        </span>
                      </MarkerInfo>
                    ) : (
                      <TierBadge band={b} plain />
                    )}
                  </span>
                )}
              </div>

              {/* Option 1, Comfortable. gmc-t-lg, not a display step. Measured
                  across the data: only 10 of 125 values are short enough to be
                  a number, the median is 31 characters and the longest is 51.
                  A display size was designed for the 8% and broke the 92%.
                  Hierarchy comes from contrast and position instead: the value
                  is near-black, everything around it is muted. */}
              <div className="gmc-t-lg leading-snug mt-1" style={{ color: "var(--gmc-ink)" }}>
                {entry?.short ? (
                  <GlossaryText text={entry.short} glossary={glossary} />
                ) : (
                  <span className="gmc-t-md" style={{ color: "var(--gmc-muted)" }}>Not recorded</span>
                )}
              </div>

              <ProvenanceNote verified={entry?.verified} className="block mt-1.5" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
