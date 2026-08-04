import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import FeatureCard from "@/components/FeatureCard";
import { isNotableForSelection } from "@/lib/notable";
import { coverState, gapFeatures, COVER_STATE } from "@/lib/gaps";

/**
 * One list, two lenses.
 *
 * This replaces what were two stacked panels ("Where they differ" and "Where
* cover stops"). They overlapped on roughly two thirds of their rows, the same
* feature, the same values, printed twice, because "one insurer doesn't cover
 * this" is simply a common KIND of difference, not a separate subject.
 *
 * So the rows are unioned and the distinction becomes a filter. Cover state is
 * shown as a chip only when it is something other than plainly covered, which
 * keeps ordinary rows light and makes the gaps read at a glance.
 *
 * Rows where NO selected insurer has a confirmed answer are held back in a
 * collapsed group at the end: they say nothing about the policies, only about
 * how far the verification pass has got, and they crowd out real findings.
 */
export default function DifferencesPanel({
  features, insurers, lookup, glossary, explanation, onOpen,
}) {
  const [lens, setLens] = useState("all");
  const [showUnconfirmed, setShowUnconfirmed] = useState(false);

  const notable = features.filter((f) => isNotableForSelection(f, insurers, lookup));
  const gapRows = gapFeatures(features, insurers, lookup);
  const gapNames = new Set(gapRows.map((r) => r.feature.feature));

  const union = [];
  const seen = new Set();
  const push = (f) => {
    if (seen.has(f.feature)) return;
    seen.add(f.feature);
    const states = insurers.map((ins) => coverState(lookup[ins.id]?.[f.feature]));
    const allUnconfirmed = states.every((s) => s === COVER_STATE.UNSTATED);
    union.push({
      f,
      states,
      allUnconfirmed,
      isGap: gapNames.has(f.feature),
      isNotable: notable.includes(f),
    });
  };
  notable.forEach(push);
  gapRows.forEach((r) => push(r.feature));

  const live = union.filter((r) => !r.allUnconfirmed);
  const unconfirmed = union.filter((r) => r.allUnconfirmed);

  const rows = lens === "gaps" ? live.filter((r) => r.isGap) : live;
  const gapCount = live.filter((r) => r.isGap).length;

  if (!live.length && !unconfirmed.length) return null;

  const Lens = ({ id, label, count }) => {
    const active = lens === id;
    return (
      <button
        type="button"
        onClick={() => setLens(id)}
        aria-pressed={active}
        className="gmc-tap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full gmc-t-sm gmc-w-strong transition-all"
        style={{
          background: active ? "var(--gmc-teal)" : "var(--gmc-bg-alt)",
          color: active ? "white" : "var(--gmc-body)",
          border: `1.5px solid ${active ? "var(--gmc-teal)" : "var(--gmc-line)"}`,
        }}
        data-testid={`differences-lens-${id}`}
      >
        {label}
        <span
          className="px-1.5 rounded-full gmc-t-xs gmc-w-heavy"
          style={{
            background: active ? "rgba(255,255,255,0.22)" : "var(--gmc-teal-tint-2)",
            color: active ? "white" : "var(--gmc-teal-deep)",
          }}
        >
          {count}
        </span>
      </button>
    );
  };

  return (
    <div data-testid="differences-panel">
      <div className="px-5 sm:px-6 pt-5 pb-3.5">
        <div
          className="gmc-t-lg sm:gmc-t-xl gmc-w-heavy tracking-tight"
          style={{ color: "var(--gmc-ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Where they differ
        </div>
        <div className="flex flex-wrap gap-2 mt-2.5">
          <Lens id="all" label="Every difference" count={live.length} />
          <Lens id="gaps" label="Where cover stops" count={gapCount} />
        </div>
        {lens === "gaps" && (
          <p className="gmc-t-sm mt-2.5 leading-relaxed" style={{ color: "var(--gmc-muted)" }}>
            Lines where at least one of these policies doesn&apos;t simply cover you. Fewer
exclusions doesn&apos;t make a policy better for you, limits, excess and price all
            matter too.
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 px-5 sm:px-6 pb-5">
        {rows.map(({ f, states }) => (
          <FeatureCard
            key={f.feature}
            feature={f}
            insurers={insurers}
            lookup={lookup}
            glossary={glossary}
            explanation={explanation}
            states={states}
            onOpen={onOpen}
          />
        ))}
      </div>

      {rows.length === 0 && (
        <p
          className="px-5 sm:px-6 py-6 gmc-t-sm text-center border-t"
          style={{ borderColor: "var(--gmc-line)", color: "var(--gmc-body)" }}
        >
          None of these policies has a stated gap on the lines we&apos;ve checked.
        </p>
      )}

      {unconfirmed.length > 0 && (
        <div className="border-t" style={{ borderColor: "var(--gmc-line)" }}>
          <button
            type="button"
            onClick={() => setShowUnconfirmed((o) => !o)}
            className="gmc-tap w-full flex items-center gap-2 px-5 sm:px-6 py-3 text-left"
            aria-expanded={showUnconfirmed}
            data-testid="differences-unconfirmed-toggle"
          >
            {showUnconfirmed
              ? <ChevronDown className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} style={{ color: "var(--gmc-muted)" }} />
              : <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} style={{ color: "var(--gmc-muted)" }} />}
            <span className="gmc-t-sm gmc-w-strong" style={{ color: "var(--gmc-body)" }}>
              {unconfirmed.length} line{unconfirmed.length === 1 ? "" : "s"} we haven&apos;t
              confirmed for any of these policies
            </span>
          </button>
          {showUnconfirmed && (
            <div className="px-5 sm:px-6 pb-4">
              <p className="gmc-t-sm leading-relaxed mb-2.5" style={{ color: "var(--gmc-muted)" }}>
                We haven&apos;t found these stated in the policy documents yet. That says nothing
about whether the policies cover them. Only that nobody has checked. Ask an
                adviser if any of these matter to you.
              </p>
              <ul className="space-y-1.5">
                {unconfirmed.map(({ f }) => (
                  <li key={f.feature}>
                    <button
                      type="button"
                      onClick={() => onOpen(f.feature)}
                      className="text-left gmc-t-sm gmc-w-strong underline decoration-dotted underline-offset-2 hover:decoration-solid"
                      style={{ color: "var(--gmc-teal-deep)" }}
                    >
                      {f.feature}
                    </button>
                    <span className="gmc-t-sm ml-1.5" style={{ color: "var(--gmc-muted)" }}>
                      {groupLabel(f.group)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
