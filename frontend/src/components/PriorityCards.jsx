import FeatureCard from "@/components/FeatureCard";
import { isNotableForSelection } from "@/lib/notable";
import {
  priorityGroups, suggestedGroups, explanationMode,
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
      <div className="gmc-surface p-8 text-center" data-testid="priority-empty">
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

  const bandFor = (insurerId, group) => bandForGroup(insurerId, group);

  const SectionHeading = ({ children, sub }) => (
    <div className="mb-3 mt-1">
      <div
        className="gmc-t-sm sm:gmc-t-xs gmc-w-strong uppercase tracking-[0.08em]"
        style={{ color: "var(--gmc-muted)" }}
      >
        {children}
      </div>
      {sub && (
        <div className="gmc-t-sm mt-0.5" style={{ color: "var(--gmc-muted)" }}>
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
          <div className="grid sm:grid-cols-2 gap-3">
            {yours.map((f) => (
              <FeatureCard
                key={f.feature}
                feature={f}
                insurers={insurers}
                lookup={lookup}
                glossary={glossary}
                explanation={mode}
                band={bandFor}
                onOpen={onOpenFeature}
              />
            ))}
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
          <div className="grid sm:grid-cols-2 gap-3">
            {also.map((f) => (
              <FeatureCard
                key={f.feature}
                feature={f}
                insurers={insurers}
                lookup={lookup}
                glossary={glossary}
                explanation={mode}
                band={bandFor}
                note={suggestionLabelFor(f.group)}
                onOpen={onOpenFeature}
              />
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
