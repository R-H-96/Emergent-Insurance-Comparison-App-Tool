import { ChevronRight, Lightbulb } from "lucide-react";
import FeatureIcon from "@/components/FeatureIcon";
import InsurerMark from "@/components/InsurerMark";
import GlossaryText from "@/components/GlossaryText";
import TierBadge from "@/components/TierBadge";
import WhyReveal from "@/components/WhyReveal";
import { VerifiedIcon } from "@/components/VerifiedBadge";
import { isNotableForSelection } from "@/lib/notable";
import {
  groupLabel, priorityGroups, suggestedGroups, explanationMode, featureTitle,
} from "@/lib/personalisation";
import { THEME_BANDS, RADAR_THEMES } from "@/data/glanceModel";

/**
* Rung 0 of the disclosure ladder, "Your priorities".
 *
 * Two clearly separated sections:
* "What you told us matters". Differences inside groups the user chose,
 *                                 in the order they chose them.
* "Also worth knowing". A top-up so a narrow pick doesn't produce a
 *                                 one-card answer after four questions, plus
 *                                 anything suggested by the household answer,
 *                                 attributed rather than passed off as theirs.
 *
 * The section heading carries the "these are yours" meaning, so individual
* cards don't need a per-card badge. Every card in the first section is by
 * definition one they picked, which made the old badge pure decoration.
 */
const MIN_CARDS = 3;

function bandForGroup(insurerId, group) {
  const theme = RADAR_THEMES.find((t) => t.group === group);
  if (!theme) return null;
  return THEME_BANDS[insurerId]?.[theme.id] ?? null;
}

export default function PriorityCards({
  features, insurers, lookup, glossary, intake, onOpenFeature, onSeeAll,
}) {
  const groups = priorityGroups(intake);
  const suggested = suggestedGroups(intake);
  const mode = explanationMode(intake?.knowledge);

  const notable = features.filter((f) => isNotableForSelection(f, insurers, lookup));

  // Chosen groups first, in the order the user picked them.
  const yours = groups.length
    ? notable
        .filter((f) => groups.includes(f.group))
        .sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group))
    : [];

  // Top up: household suggestions first, then whatever else is notable.
  const rest = notable.filter((f) => !yours.includes(f));
  const suggestedNames = suggested.map((s) => s.group);
  const alsoPool = [
    ...rest.filter((f) => suggestedNames.includes(f.group)),
    ...rest.filter((f) => !suggestedNames.includes(f.group)),
  ];
  const also = groups.length
    ? alsoPool.slice(0, Math.max(0, MIN_CARDS - yours.length))
    : alsoPool;

  const suggestionLabelFor = (group) =>
    suggested.find((s) => s.group === group)?.label || null;

  if (!yours.length && !also.length) {
    return (
      <div className="gmc-card p-8 text-center" data-testid="priority-empty">
        <p className="gmc-t-md gmc-w-strong mb-1" style={{ color: "var(--gmc-ink)" }}>
          These policies agree on the notable points.
        </p>
        <p className="gmc-t-sm mb-4" style={{ color: "var(--gmc-body)" }}>
          Swap an insurer to surface the differences, or look through everything.
        </p>
        <button type="button" className="gmc-btn-outline gmc-tap" onClick={onSeeAll}>
          See everything
        </button>
      </div>
    );
  }

  const Card = ({ f, note }) => (
    <div
      className="gmc-card p-5 sm:p-5"
      data-testid={`priority-card-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div className="flex items-center gap-2 flex-wrap mb-1.5">
        <span
          className="gmc-t-xs gmc-w-strong uppercase tracking-[0.06em]"
          style={{ color: "var(--gmc-teal-mid)" }}
        >
          {groupLabel(f.group)}
        </span>
        {note && (
          <span
            className="inline-flex items-center rounded-full px-2 py-0.5 gmc-t-xs gmc-w-strong"
            style={{ background: "var(--gmc-bg-alt)", color: "var(--gmc-body)" }}
          >
            {note}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => onOpenFeature(f.feature)}
        className="w-full text-left"
        data-testid={`priority-open-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
      >
        <span
          className="flex items-start gap-2.5 gmc-w-heavy gmc-t-lg leading-snug"
          style={{ color: "var(--gmc-ink)" }}
        >
          <FeatureIcon name={f.feature} size={20} className="mt-1" />
          <span className="flex-1">
            {featureTitle(f, mode).primary}
            {featureTitle(f, mode).secondary && (
              <span
                className="block gmc-t-sm sm:gmc-t-xs gmc-w-strong mt-1.5"
                style={{ color: "var(--gmc-muted)" }}
              >
                {featureTitle(f, mode).secondary}
              </span>
            )}
          </span>
          <ChevronRight
            className="w-4 h-4 flex-shrink-0"
            strokeWidth={2.2}
            style={{ color: "var(--gmc-faint)" }}
            aria-hidden="true"
          />
        </span>
      </button>

      <GlossaryText
        tag="div"
        text={f.definition}
        glossary={glossary}
        className="gmc-t-base sm:gmc-t-sm mt-2.5 leading-relaxed"
      />

      {note && (
        <div
          className="flex items-start gap-1.5 mt-2.5 gmc-t-sm sm:gmc-t-xs gmc-w-strong"
          style={{ color: "var(--gmc-teal-deep)" }}
        >
          <Lightbulb className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" strokeWidth={2.2} aria-hidden="true" />
          {note}
        </div>
      )}

      <WhyReveal
        why={f.why}
        glossary={glossary}
        inline={mode.whyInline}
        testId={`why-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
      />

      <div className="mt-3.5">
        {insurers.map((ins) => {
          const entry = lookup[ins.id]?.[f.feature];
          const band = bandForGroup(ins.id, f.group);
          return (
            <div
              key={ins.id}
              className="flex items-start gap-2.5 py-3 sm:py-2.5"
              style={{ borderTop: "1px solid var(--gmc-line)" }}
            >
              <InsurerMark insurer={ins} size={24} />
              <div className="flex-1 min-w-0">
                <div
                  className="gmc-t-xs gmc-w-strong leading-tight"
                  style={{ color: ins.accent || "var(--gmc-teal-mid)" }}
                >
                  {ins.name}
                </div>
                <div
                  className="gmc-t-sm gmc-w-strong leading-snug mt-0.5"
                  style={{ color: "var(--gmc-ink-2)" }}
                >
                  {entry?.short ? (
                    <GlossaryText text={entry.short} glossary={glossary} />
                  ) : (
<span style={{ color: "var(--gmc-faint)" }}>Not recorded</span>
                  )}
                </div>
              </div>
              {band && <TierBadge band={band} className="mt-0.5 flex-shrink-0" />}
              <VerifiedIcon verified={entry?.verified} />
            </div>
          );
        })}
      </div>
    </div>
  );

  const SectionHeading = ({ children, sub }) => (
    <div className="mb-3 mt-1">
      <div
        className="gmc-t-sm sm:gmc-t-xs gmc-w-strong uppercase tracking-[0.08em]"
        style={{ color: "var(--gmc-muted)" }}
      >
        {children}
      </div>
      {sub && (
        <div className="gmc-t-sm mt-0.5" style={{ color: "var(--gmc-faint)" }}>
          {sub}
        </div>
      )}
    </div>
  );

  return (
    <div data-testid="priority-cards">
      {yours.length > 0 && (
        <>
          <SectionHeading>What you told us matters</SectionHeading>
          <div className="space-y-3">
            {yours.map((f) => <Card key={f.feature} f={f} />)}
          </div>
        </>
      )}

      {also.length > 0 && (
        <div className={yours.length ? "mt-7" : ""}>
          <SectionHeading
            sub={
              yours.length
                ? "Not something you picked, but these policies differ here too."
                : null
            }
          >
            {yours.length ? "Also worth knowing" : "Where these policies differ"}
          </SectionHeading>
          <div className="space-y-3">
            {also.map((f) => (
              <Card key={f.feature} f={f} note={suggestionLabelFor(f.group)} />
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onSeeAll}
        className="gmc-btn-outline gmc-tap w-full mt-4"
        data-testid="priority-see-all"
      >
        See all 25 features
      </button>
    </div>
  );
}
