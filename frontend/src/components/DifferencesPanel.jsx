import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import FeatureIcon from "@/components/FeatureIcon";
import InsurerMark from "@/components/InsurerMark";
import GlossaryText from "@/components/GlossaryText";
import WhyReveal from "@/components/WhyReveal";
import MarkerInfo from "@/components/MarkerInfo";
import { groupLabel, featureTitle } from "@/lib/personalisation";
import { isNotableForSelection } from "@/lib/notable";
import { coverState, gapFeatures, STATE_META, COVER_STATE } from "@/lib/gaps";

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
        className="gmc-tap inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all"
        style={{
          background: active ? "var(--gmc-teal)" : "var(--gmc-bg-alt)",
          color: active ? "white" : "var(--gmc-body)",
          border: `1.5px solid ${active ? "var(--gmc-teal)" : "var(--gmc-line)"}`,
        }}
        data-testid={`differences-lens-${id}`}
      >
        {label}
        <span
          className="px-1.5 rounded-full text-[11px] font-extrabold"
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
    <div className="gmc-card overflow-hidden" data-testid="differences-panel">
      <div className="px-5 sm:px-6 pt-5 pb-3.5">
        <div
          className="text-[18px] sm:text-[20px] font-extrabold tracking-tight"
          style={{ color: "var(--gmc-ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Where they differ
        </div>
        <div className="flex flex-wrap gap-2 mt-2.5">
          <Lens id="all" label="Every difference" count={live.length} />
          <Lens id="gaps" label="Where cover stops" count={gapCount} />
        </div>
        {lens === "gaps" && (
          <p className="text-[12px] mt-2.5 leading-relaxed" style={{ color: "var(--gmc-muted)" }}>
            Lines where at least one of these policies doesn&apos;t simply cover you. Fewer
exclusions doesn&apos;t make a policy better for you, limits, excess and price all
            matter too.
          </p>
        )}
      </div>

      {rows.map(({ f, states }) => (
        <div
          key={f.feature}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(f.feature)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(f.feature); }
          }}
          className="w-full text-left px-5 sm:px-6 py-4 border-t cursor-pointer transition-colors hover:bg-[color:var(--gmc-teal-tint)] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gmc-teal)]"
          style={{ borderColor: "var(--gmc-line)" }}
          data-testid={`diff-row-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.06em]"
            style={{ color: "var(--gmc-teal-mid)" }}
          >
            {groupLabel(f.group)}
          </span>
          <div
            className="flex items-center gap-2 font-extrabold text-[15px] leading-snug mt-0.5"
            style={{ color: "var(--gmc-ink)" }}
          >
            <FeatureIcon name={f.feature} size={18} />
            <span className="flex-1">
              {featureTitle(f, explanation).primary}
              {featureTitle(f, explanation).secondary && (
                <span
                  className="block text-[11.5px] font-semibold mt-0.5"
                  style={{ color: "var(--gmc-muted)" }}
                >
                  {featureTitle(f, explanation).secondary}
                </span>
              )}
            </span>
            <ChevronRight
              className="w-4 h-4 flex-shrink-0"
              strokeWidth={2.2}
              style={{ color: "var(--gmc-faint)" }}
              aria-hidden="true"
            />
          </div>

          {f.definition && (
            <GlossaryText
              tag="div"
              text={f.definition}
              glossary={glossary}
              className="mt-1 text-[12px] leading-snug"
            />
          )}

          {f.why && (
            <div onClick={(e) => e.stopPropagation()}>
              <WhyReveal
                why={f.why}
                glossary={glossary}
                inline={!!explanation?.whyInline}
                testId={`why-diff-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
              />
            </div>
          )}

          <div className="mt-3 space-y-1.5">
            {insurers.map((ins, i) => {
              const entry = lookup[ins.id]?.[f.feature];
              const state = states[i];
              const meta = STATE_META[state];
              const flag = state !== COVER_STATE.COVERED;
              return (
                <div key={ins.id} className="flex items-start gap-2">
                  <InsurerMark insurer={ins} size={20} />
                  {flag && (
                    <MarkerInfo title={meta.label} label={meta.help}>
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-[10.5px] font-bold whitespace-nowrap"
                        style={{ background: meta.fill, color: meta.text }}
                      >
                        {meta.label}
                      </span>
                    </MarkerInfo>
                  )}
                  <span
                    className="text-[13px] font-semibold leading-snug min-w-0"
                    style={{ color: "var(--gmc-ink-2)" }}
                  >
                    {entry?.short ? (
                      <GlossaryText text={entry.short} glossary={glossary} />
                    ) : (
<span style={{ color: "var(--gmc-faint)" }}>Not recorded</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {rows.length === 0 && (
        <p
          className="px-5 sm:px-6 py-6 text-[13px] text-center border-t"
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
            <span className="text-[12.5px] font-bold" style={{ color: "var(--gmc-body)" }}>
              {unconfirmed.length} line{unconfirmed.length === 1 ? "" : "s"} we haven&apos;t
              confirmed for any of these policies
            </span>
          </button>
          {showUnconfirmed && (
            <div className="px-5 sm:px-6 pb-4">
              <p className="text-[12px] leading-relaxed mb-2.5" style={{ color: "var(--gmc-muted)" }}>
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
                      className="text-left text-[13px] font-semibold underline decoration-dotted underline-offset-2 hover:decoration-solid"
                      style={{ color: "var(--gmc-teal-deep)" }}
                    >
                      {f.feature}
                    </button>
                    <span className="text-[12px] ml-1.5" style={{ color: "var(--gmc-faint)" }}>
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
