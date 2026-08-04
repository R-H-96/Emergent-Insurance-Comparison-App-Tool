import { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { VerifiedIcon } from "@/components/VerifiedBadge";
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
      <div className="gmc-card p-10 text-center" data-testid="comparison-empty">
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
      <div className="gmc-card overflow-hidden hidden md:block" data-testid="comparison-table">
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
                  background: "linear-gradient(to right, var(--gmc-teal-tint-2) 0%, var(--gmc-bg-alt) 55%)",
                  borderBottom: "1px solid var(--gmc-line)",
                  borderLeft: "4px solid var(--gmc-teal)",
                }}
                aria-expanded={!isCollapsed}
                data-testid={`group-toggle-${group}`}
              >
                <div className="p-3.5 flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--gmc-teal-tint)", color: "var(--gmc-teal-deep)" }}
                  >
                    {isCollapsed
                      ? <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                      : <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />}
                  </div>
                  <span className="gmc-t-sm gmc-w-strong" style={{ color: "var(--gmc-ink)" }}>
                    {groupLabel(group)}
                  </span>
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 gmc-t-xs gmc-w-strong"
                    style={{ background: "var(--gmc-teal-tint-2)", color: "var(--gmc-teal-deep)" }}
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
                              className="inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
                              style={{ background: "var(--gmc-teal)", color: "white" }}
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
                            background: isNotablePair ? "transparent" : columnTints[i],
                          }}
                          data-testid={`cell-${ins.id}-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                        >
                          <div className="gmc-t-sm gmc-w-strong leading-snug flex-1" style={{ color: "var(--gmc-ink-2)" }}>
{entry?.short ? <GlossaryText text={entry.short} glossary={glossary} />: <span style={{ color: "var(--gmc-muted)" }}>Not recorded</span>}
                          </div>
                          <VerifiedIcon verified={entry?.verified} />
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
            <div key={group} className="gmc-card overflow-hidden">
              {/* Mobile group header */}
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center gap-2.5 p-4 gmc-tap text-left transition-colors"
                style={{
                  background: "linear-gradient(to right, var(--gmc-teal-tint-2), var(--gmc-bg-alt) 70%)",
                  borderLeft: "4px solid var(--gmc-teal)",
                }}
                aria-expanded={!isCollapsed}
                data-testid={`mobile-group-toggle-${group}`}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--gmc-teal-tint)", color: "var(--gmc-teal-deep)" }}
                >
                  {isCollapsed
                    ? <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.5} />
                    : <ChevronDown className="w-3.5 h-3.5" strokeWidth={2.5} />}
                </div>
                <span className="gmc-t-base gmc-w-strong" style={{ color: "var(--gmc-ink)" }}>
                  {groupLabel(group)}
                </span>
                <span
                  className="ml-auto inline-flex items-center rounded-full px-2 py-0.5 gmc-t-xs gmc-w-strong"
                  style={{ background: "var(--gmc-teal-tint-2)", color: "var(--gmc-teal-deep)" }}
                >
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
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
                            style={{ background: "var(--gmc-teal)", color: "white" }}
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
                          inline={!!explanation?.whyInline}
                          testId={`why-mobile-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                        />
                      </div>
                    )}
                    <div className="mt-3 space-y-2">
                      {insurers.map((ins) => {
                        const entry = lookup[ins.id]?.[f.feature];
                        return (
                          <div
                            key={ins.id}
                            className="rounded-[var(--gmc-r-ctl)] p-3 border"
                            style={{
                              background: hexToRgba(ins.accent, 0.05),
                              borderColor: "var(--gmc-line)",
                            }}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-2">
{/* Circular mark, replaces rectangular InsurerLogo */}
                                <InsurerMark insurer={ins} size={28} />
                                <div
                                  className="gmc-t-sm gmc-w-strong"
                                  style={{ color: ins.accent || "var(--gmc-teal-mid)" }}
                                >
                                  {ins.name}
                                </div>
                              </div>
                              <VerifiedIcon verified={entry?.verified} />
                            </div>
                            <div className="gmc-t-base gmc-w-strong leading-snug" style={{ color: "var(--gmc-ink-2)" }}>
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
