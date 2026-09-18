import { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import ProvenanceNote from "@/components/ProvenanceNote";
import GlossaryText from "@/components/GlossaryText";
import InsurerMark from "@/components/InsurerMark";
import InsurerLogo from "@/components/InsurerLogo";
import SourceLink from "@/components/SourceLink";
import FeatureIcon from "@/components/FeatureIcon";
import WhyReveal from "@/components/WhyReveal";
import MarkerInfo from "@/components/MarkerInfo";
import { isNotableForSelection } from "@/lib/notable";
import { groupLabel, featureTitle } from "@/lib/personalisation";
import { pushEvent } from "@/lib/analytics";

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== "string") return `rgba(20,181,175,${alpha})`;
  const h = hex.replace("#", "");
  const parse = (i) => parseInt(h.substring(i, i + 2), 16);
  return `rgba(${parse(0)},${parse(2)},${parse(4)},${alpha})`;
}

const rowId = (name) => `row-${name.replace(/\s+/g, "-").toLowerCase()}`;

export default function ComparisonTable({
  insurers, features, data, glossary, activeGroups,
  openGroups, flashFeature, explanation, onOpenFeature, onClearFilters,
}) {
  const grouped = useMemo(() => {
    const g = new Map();
    features.forEach((f) => {
      if (!g.has(f.group)) g.set(f.group, []);
      g.get(f.group).push(f);
    });
    return Array.from(g.entries());
  }, [features]);

  const defaultCollapsed = useMemo(() => {
    const s = new Set();
    const opens = openGroups && openGroups.length > 0 ? openGroups : ["Core limits"];
    grouped.forEach(([group]) => { if (!opens.includes(group)) s.add(group); });
    return s;
  }, [grouped, openGroups]);

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  useEffect(() => setCollapsed(defaultCollapsed), [defaultCollapsed]);

  useEffect(() => {
    if (!flashFeature) return;
    const f = features.find((x) => x.feature === flashFeature);
    if (!f) return;
    setCollapsed((prev) => {
      if (!prev.has(f.group)) return prev;
      const next = new Set(prev); next.delete(f.group); return next;
    });
  }, [flashFeature, features]);

  const lookup = useMemo(() => {
    const out = {};
    insurers.forEach((ins) => {
      out[ins.id] = {};
      (data[ins.id] || []).forEach((row) => { out[ins.id][row.feature] = row; });
    });
    return out;
  }, [insurers, data]);

  const toggleGroup = (group) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
    pushEvent("gmc_group_open", { group });
  };

  const cols = insurers.length;
  const gridTemplate = `minmax(0, 1.2fr) repeat(${cols}, minmax(0, 1fr))`;
  const columnTints = insurers.map((i) => hexToRgba(i.accent, 0.08));

  const visibleGrouped = grouped
    .filter(([group]) => activeGroups.length === 0 ? true : activeGroups.includes(group))
    .map(([group, feats]) => [group, feats, feats])
    .filter(([, , visible]) => visible.length > 0);

  if (!visibleGrouped.length) {
    const hasFilters = activeGroups.length > 0;
    return (
      <div className="gmc-surface p-10 text-center" data-testid="comparison-empty">
        <p className="gmc-t-base gmc-w-strong" style={{ color: "var(--gmc-ink)" }}>
          {hasFilters ? "Nothing in this section for this comparison." : "No features match your current filters."}
        </p>
        {hasFilters && (
          <button type="button" className="gmc-btn-outline gmc-tap mt-4" onClick={onClearFilters} data-testid="comparison-empty-clear">
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop grid ── */}
      <div className="gmc-surface overflow-hidden hidden md:block" data-testid="comparison-table">
        {/* Header */}
        <div
          className="grid"
          style={{ gridTemplateColumns: gridTemplate, borderBottom: "1px solid var(--gmc-line)", background: "var(--gmc-card)" }}
        >
          <div className="p-4 gmc-eyebrow">Feature</div>
          {insurers.map((ins, i) => (
            <div
              key={ins.id}
              className="p-4"
              style={{
                borderLeft: "1px solid var(--gmc-line)",
                borderTop: `4px solid ${ins.accent || "var(--gmc-teal)"}`,
                background: columnTints[i],
              }}
              data-testid={`header-${ins.id}`}
            >
              <div className="flex items-center gap-2.5">
                <InsurerLogo insurer={ins} size={32} />
                <div>
                  <div className="gmc-w-heavy gmc-t-md leading-tight" style={{ color: ins.accent || "var(--gmc-ink)" }}>
                    {ins.name}
                  </div>
                  <div className="gmc-t-sm gmc-w-strong mt-0.5" style={{ color: "var(--gmc-muted)" }}>
                    {ins.product}
                  </div>
                </div>
              </div>
              <div className="mt-1.5">
                <SourceLink insurer={ins} />
              </div>
            </div>
          ))}
        </div>

        {visibleGrouped.map(([group, , visibleFeats]) => {
          const isCollapsed = collapsed.has(group);
          return (
            <div key={group} data-testid={`group-${group}`}>
{/* Group header. Redesigned: gradient + left accent + pill count */}
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="w-full grid text-left transition-colors"
                style={{
                  gridTemplateColumns: gridTemplate,
                  background: "transparent",
                  borderBottom: "1px solid var(--gmc-line)",
                  borderLeft: "4px solid var(--gmc-teal)",
                }}
                aria-expanded={!isCollapsed}
                data-testid={`group-toggle-${group}`}
              >
                <div className="p-3.5 flex items-center gap-2.5">
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{ color: "var(--gmc-muted)" }}
                  >
                    {isCollapsed
                      ? <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                      : <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />}
                  </div>
                  <span className="gmc-t-sm gmc-w-strong" style={{ color: "var(--gmc-ink)" }}>
                    {groupLabel(group)}
                  </span>
                  <span
                    className="inline-flex items-center gmc-t-sm"
                    style={{ color: "var(--gmc-muted)" }}
                  >
                    {visibleFeats.length}
                  </span>
                </div>
                {insurers.map((ins) => (
                  <div key={ins.id} className="p-3.5" style={{ borderLeft: "1px solid var(--gmc-line)" }} />
                ))}
              </button>

              {!isCollapsed && visibleFeats.map((f) => {
                const isFlashing = flashFeature === f.feature;
                const isNotablePair = isNotableForSelection(f, insurers, lookup);
                return (
                  <div
                    key={f.feature}
                    id={rowId(f.feature)}
                    className={`grid group cursor-pointer transition-colors hover:bg-[color:var(--gmc-teal-tint)] ${
                      isNotablePair ? "gmc-notable-row" : ""
                    } ${isFlashing ? "gmc-flash" : ""}`}
                    style={{ gridTemplateColumns: gridTemplate, borderBottom: "1px solid var(--gmc-line)", scrollMarginTop: 96 }}
                    onClick={() => onOpenFeature(f.feature)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenFeature(f.feature); } }}
                    data-testid={`row-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-2 gmc-w-strong gmc-t-base leading-snug" style={{ color: "var(--gmc-ink)" }}>
                        <FeatureIcon name={f.feature} size={18} />
                        <span>
                          {featureTitle(f, explanation).primary}
                        </span>
                        {isNotablePair && (
                          <MarkerInfo
                            title="These policies differ here"
                            label="The insurers you're comparing say meaningfully different things on this line. Rows without this marker are broadly in agreement."
                          >
                            <span
                              className="inline-flex items-center justify-center flex-shrink-0"
                              style={{ color: "var(--gmc-teal)" }}
                            >
                              <Sparkles className="w-2.5 h-2.5" strokeWidth={2.5} />
                            </span>
                          </MarkerInfo>
                        )}
                      </div>
                      <GlossaryText tag="div" text={f.definition} glossary={glossary} className="gmc-t-sm mt-1 leading-relaxed" />
                      {f.why && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <WhyReveal
                            why={f.why}
                            glossary={glossary}
                            inline={false}
                            testId={`why-desktop-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                          />
                        </div>
                      )}
                    </div>
                    {insurers.map((ins, i) => {
                      const entry = lookup[ins.id]?.[f.feature];
                      return (
                        <div
                          key={ins.id}
                          className="p-4 flex items-start gap-2"
                          style={{
                            borderLeft: "1px solid var(--gmc-line)",
                            /* Tint means insurer, always. It used to be applied
                               only to non-notable rows, so the same device said
                               "this is nib" and "this row is unremarkable", and
                               the rows that mattered most had the least colour.
                               Notability is the sparkle's job alone now. */
                            background: columnTints[i],
                          }}
                          data-testid={`cell-${ins.id}-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                        >
                          {/* Same provenance treatment as the mobile rows. Two
                              different markers for the same fact was itself a
                              device doing two jobs. */}
                          <div className="flex-1 min-w-0">
                            <div className="gmc-t-sm gmc-w-strong leading-snug" style={{ color: "var(--gmc-ink)" }}>
{entry?.short ? <GlossaryText text={entry.short} glossary={glossary} />: <span style={{ color: "var(--gmc-muted)" }}>Not recorded</span>}
                            </div>
                            <ProvenanceNote verified={entry?.verified} className="block mt-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* ── Mobile stacked cards ── */}
      <div className="md:hidden space-y-4" data-testid="comparison-mobile">
        {visibleGrouped.map(([group, , visibleFeats]) => {
          const isCollapsed = collapsed.has(group);
          return (
            <div key={group} className="gmc-surface overflow-hidden">
              {/* Mobile group header */}
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center gap-2.5 p-4 gmc-tap text-left transition-colors"
                aria-expanded={!isCollapsed}
                data-testid={`mobile-group-toggle-${group}`}
              >
                {/* One device for the heading: weight. The chevron is a plain
                    glyph and the count is plain text, where they were a tinted
                    circle and a filled pill saying the same two things. */}
                {isCollapsed
                  ? <ChevronRight className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} style={{ color: "var(--gmc-muted)" }} />
                  : <ChevronDown className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} style={{ color: "var(--gmc-muted)" }} />}
                <span className="gmc-t-md gmc-w-heavy" style={{ color: "var(--gmc-ink)" }}>
                  {groupLabel(group)}
                </span>
                <span className="ml-auto gmc-t-sm" style={{ color: "var(--gmc-muted)" }}>
                  {visibleFeats.length}
                </span>
              </button>

              {!isCollapsed && visibleFeats.map((f) => {
                const isFlashing = flashFeature === f.feature;
                const isNotablePair = isNotableForSelection(f, insurers, lookup);
                return (
                  <div
                    key={f.feature}
                    id={rowId(f.feature)}
                    className={`p-4 border-t cursor-pointer ${
                      isNotablePair ? "gmc-notable-row" : ""
                    } ${isFlashing ? "gmc-flash" : ""}`}
                    style={{ borderColor: "var(--gmc-line)", scrollMarginTop: 96 }}
                    onClick={() => onOpenFeature(f.feature)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenFeature(f.feature); } }}
                    data-testid={`mobile-row-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <div className="flex items-center gap-2 gmc-w-strong gmc-t-md" style={{ color: "var(--gmc-ink)" }}>
                      <FeatureIcon name={f.feature} size={18} />
                      <span>
                        {featureTitle(f, explanation).primary}
                      </span>
                      {isNotablePair && (
                        <MarkerInfo
                          title="These policies differ here"
                          label="The insurers you're comparing say meaningfully different things on this line. Rows without this marker are broadly in agreement."
                        >
                          <Sparkles
                            className="w-3.5 h-3.5 flex-shrink-0"
                            strokeWidth={2.5}
                            style={{ color: "var(--gmc-teal)" }}
                          />
                        </MarkerInfo>
                      )}
                    </div>
                    <GlossaryText tag="div" text={f.definition} glossary={glossary} className="gmc-t-sm mt-1 leading-relaxed" />
                    {f.why && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <WhyReveal
                          why={f.why}
                          glossary={glossary}
                          inline={!!explanation?.whyInline}
                          testId={`why-mobile-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                        />
                      </div>
                    )}
                    <div className="mt-3 space-y-2">
                      {insurers.map((ins, idx) => {
                        const entry = lookup[ins.id]?.[f.feature];
                        return (
                          /* Direction A. The tinted, bordered card per insurer is
                             gone: three of these stacked made four boxes around
                             one number. A hairline separates them instead.

                             Three devices, one job each.
                               size   the value, largest thing in the row
                               weight the value again, nothing else is strong
                               mark   which insurer, so colour is not carrying
                                      identity as text. That also retires the
                                      insurer accent as a text colour, which
                                      failed contrast for nib at 2.22 on every
                                      background. */
                          <div
                            key={ins.id}
                            className="py-2.5"
                            style={{ borderTop: idx === 0 ? "none" : "1px solid var(--gmc-line)" }}
                          >
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="inline-flex items-center gap-1.5 gmc-t-sm flex-shrink-0" style={{ color: "var(--gmc-muted)" }}>
                                <InsurerMark insurer={ins} size={18} />
                                {ins.name}
                              </span>
                              <ProvenanceNote verified={entry?.verified} />
                            </div>
                            <div className="gmc-t-md gmc-w-strong leading-snug mt-0.5" style={{ color: "var(--gmc-ink)" }}>
{entry?.short ? <GlossaryText text={entry.short} glossary={glossary} />: <span style={{ color: "var(--gmc-muted)" }}>Not recorded</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex items-center gap-1" style={{ color: "var(--gmc-teal-mid)" }}>
                      <span className="gmc-t-sm gmc-w-strong">View full detail</span>
                      <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </>
  );
}
