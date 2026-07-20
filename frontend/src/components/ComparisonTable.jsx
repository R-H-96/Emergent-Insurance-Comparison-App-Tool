import { useMemo, useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { VerifiedIcon } from "@/components/VerifiedBadge";
import GlossaryText from "@/components/GlossaryText";
import InsurerLogo from "@/components/InsurerLogo";
import { isNotableForSelection } from "@/lib/notable";
import { pushEvent } from "@/lib/analytics";

// Turn "#RRGGBB" into "rgba(r,g,b,alpha)"
function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== "string") return `rgba(20,181,175,${alpha})`;
  const h = hex.replace("#", "");
  const parse = (i) => parseInt(h.substring(i, i + 2), 16);
  return `rgba(${parse(0)},${parse(2)},${parse(4)},${alpha})`;
}

const rowId = (name) => `row-${name.replace(/\s+/g, "-").toLowerCase()}`;

export default function ComparisonTable({
  insurers,
  features,
  data,
  glossary,
  diffOnly,
  activeGroups,
  openGroups,
  flashFeature,
  onOpenFeature,
  onClearFilters,
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
    grouped.forEach(([group]) => {
      if (!opens.includes(group)) s.add(group);
    });
    return s;
  }, [grouped, openGroups]);

  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  useEffect(() => setCollapsed(defaultCollapsed), [defaultCollapsed]);

  // When flashFeature changes, ensure its group is open
  useEffect(() => {
    if (!flashFeature) return;
    const f = features.find((x) => x.feature === flashFeature);
    if (!f) return;
    setCollapsed((prev) => {
      if (!prev.has(f.group)) return prev;
      const next = new Set(prev);
      next.delete(f.group);
      return next;
    });
  }, [flashFeature, features]);

  const lookup = useMemo(() => {
    const out = {};
    insurers.forEach((ins) => {
      out[ins.id] = {};
      (data[ins.id] || []).forEach((row) => {
        out[ins.id][row.feature] = row;
      });
    });
    return out;
  }, [insurers, data]);

  const toggleGroup = (group) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const cols = insurers.length;
  const gridTemplate = `minmax(0, 1.2fr) repeat(${cols}, minmax(0, 1fr))`;

  // Per-insurer column background tints (~5%)
  const columnTints = insurers.map((i) => hexToRgba(i.accent, 0.05));

  const visibleGrouped = grouped
    .filter(([group]) =>
      activeGroups.length === 0 ? true : activeGroups.includes(group),
    )
    .map(([group, feats]) => {
      const visible = diffOnly
        ? feats.filter((f) => isNotableForSelection(f, insurers, lookup))
        : feats;
      return [group, feats, visible];
    })
    .filter(([, , visible]) => visible.length > 0);

  if (!visibleGrouped.length) {
    const hasFilters = diffOnly || activeGroups.length > 0;
    return (
      <div className="gmc-card p-10 text-center" data-testid="comparison-empty">
        <p className="text-[14px] font-semibold" style={{ color: "var(--gmc-ink)" }}>
          {hasFilters
            ? "No rows in this group for this pair."
            : "No features match your current filters."}
        </p>
        {hasFilters && (
          <button
            type="button"
            className="gmc-btn-outline gmc-tap mt-4"
            onClick={onClearFilters}
            data-testid="comparison-empty-clear"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Desktop grid */}
      <div
        className="gmc-card overflow-hidden hidden md:block"
        data-testid="comparison-table"
      >
        {/* Header row */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: gridTemplate,
            borderBottom: "1px solid var(--gmc-line)",
            background: "var(--gmc-card)",
          }}
        >
          <div className="p-4 gmc-eyebrow">Feature</div>
          {insurers.map((ins, i) => (
            <div
              key={ins.id}
              className="p-4"
              style={{
                borderLeft: "1px solid var(--gmc-line)",
                borderTop: `3px solid ${ins.accent || "var(--gmc-teal)"}`,
                background: columnTints[i],
              }}
              data-testid={`header-${ins.id}`}
            >
              <div className="flex items-center gap-2.5">
                <InsurerLogo insurer={ins} size={30} />
                <div>
                  <div
                    className="font-extrabold text-[15px] leading-tight"
                    style={{ color: ins.accent || "var(--gmc-ink)" }}
                  >
                    {ins.name}
                  </div>
                  <div
                    className="text-[12px] font-semibold mt-0.5"
                    style={{ color: "var(--gmc-muted)" }}
                  >
                    {ins.product}
                  </div>
                </div>
              </div>
              <div
                className="text-[11px] mt-1.5 leading-snug"
                style={{ color: "var(--gmc-muted)" }}
              >
                {ins.version}
              </div>
            </div>
          ))}
        </div>

        {visibleGrouped.map(([group, , visibleFeats]) => {
          const isCollapsed = collapsed.has(group);
          return (
            <div key={group} data-testid={`group-${group}`}>
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="w-full grid text-left transition-colors"
                style={{
                  gridTemplateColumns: gridTemplate,
                  background: "var(--gmc-bg-alt)",
                  borderBottom: "1px solid var(--gmc-line)",
                }}
                aria-expanded={!isCollapsed}
                data-testid={`group-toggle-${group}`}
              >
                <div className="p-3 flex items-center gap-2">
                  {isCollapsed ? (
                    <ChevronRight
                      className="w-4 h-4"
                      strokeWidth={2.5}
                      style={{ color: "var(--gmc-teal-deep)" }}
                    />
                  ) : (
                    <ChevronDown
                      className="w-4 h-4"
                      strokeWidth={2.5}
                      style={{ color: "var(--gmc-teal-deep)" }}
                    />
                  )}
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.1em]"
                    style={{ color: "var(--gmc-teal-deep)" }}
                  >
                    {group}
                  </span>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: "var(--gmc-muted)" }}
                  >
                    · {visibleFeats.length} row{visibleFeats.length === 1 ? "" : "s"}
                  </span>
                </div>
                {insurers.map((ins) => (
                  <div
                    key={ins.id}
                    className="p-3"
                    style={{ borderLeft: "1px solid var(--gmc-line)" }}
                  />
                ))}
              </button>

              {!isCollapsed &&
                visibleFeats.map((f) => {
                  const isFlashing = flashFeature === f.feature;
                  const isNotablePair = isNotableForSelection(f, insurers, lookup);
                  return (
                    <div
                      key={f.feature}
                      id={rowId(f.feature)}
                      className={`grid group cursor-pointer transition-colors hover:bg-[color:var(--gmc-teal-tint)] ${
                        isNotablePair ? "gmc-notable-row" : ""
                      } ${isFlashing ? "gmc-flash" : ""}`}
                      style={{
                        gridTemplateColumns: gridTemplate,
                        borderBottom: "1px solid var(--gmc-line)",
                        scrollMarginTop: 96,
                      }}
                      onClick={() => onOpenFeature(f.feature)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onOpenFeature(f.feature);
                        }
                      }}
                      data-testid={`row-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      <div className="p-4">
                        <div
                          className="font-bold text-[14px] leading-snug"
                          style={{ color: "var(--gmc-ink)" }}
                        >
                          {f.feature}
                        </div>
                        <GlossaryText
                          tag="div"
                          text={f.definition}
                          glossary={glossary}
                          className="text-[12px] mt-1 leading-relaxed"
                        />
                      </div>
                      {insurers.map((ins, i) => {
                        const entry = lookup[ins.id]?.[f.feature];
                        return (
                          <div
                            key={ins.id}
                            className="p-4 flex items-start gap-2"
                            style={{
                              borderLeft: "1px solid var(--gmc-line)",
                              background: columnTints[i],
                            }}
                            data-testid={`cell-${ins.id}-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                          >
                            <div
                              className="text-[13px] font-semibold leading-snug flex-1"
                              style={{ color: "var(--gmc-ink-2)" }}
                            >
                              {entry?.short ? (
                                <GlossaryText text={entry.short} glossary={glossary} />
                              ) : (
                                <span
                                  className="italic font-normal"
                                  style={{ color: "var(--gmc-faint)" }}
                                >
                                  Not extracted
                                </span>
                              )}
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

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-4" data-testid="comparison-mobile">
        {visibleGrouped.map(([group, , visibleFeats]) => {
          const isCollapsed = collapsed.has(group);
          return (
            <div key={group} className="gmc-card overflow-hidden">
              <button
                type="button"
                onClick={() => toggleGroup(group)}
                className="w-full flex items-center gap-2 p-4 gmc-tap text-left"
                style={{ background: "var(--gmc-bg-alt)" }}
                aria-expanded={!isCollapsed}
                data-testid={`mobile-group-toggle-${group}`}
              >
                {isCollapsed ? (
                  <ChevronRight
                    className="w-4 h-4"
                    strokeWidth={2.5}
                    style={{ color: "var(--gmc-teal-deep)" }}
                  />
                ) : (
                  <ChevronDown
                    className="w-4 h-4"
                    strokeWidth={2.5}
                    style={{ color: "var(--gmc-teal-deep)" }}
                  />
                )}
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.1em]"
                  style={{ color: "var(--gmc-teal-deep)" }}
                >
                  {group}
                </span>
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: "var(--gmc-muted)" }}
                >
                  · {visibleFeats.length}
                </span>
              </button>

              {!isCollapsed &&
                visibleFeats.map((f) => {
                  const isFlashing = flashFeature === f.feature;
                  const isNotablePair = isNotableForSelection(f, insurers, lookup);
                  return (
                    <div
                      key={f.feature}
                      id={rowId(f.feature)}
                      className={`p-4 border-t cursor-pointer ${
                        isNotablePair ? "gmc-notable-row" : ""
                      } ${isFlashing ? "gmc-flash" : ""}`}
                      style={{
                        borderColor: "var(--gmc-line)",
                        scrollMarginTop: 96,
                      }}
                      onClick={() => onOpenFeature(f.feature)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onOpenFeature(f.feature);
                        }
                      }}
                      data-testid={`mobile-row-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                    >
                      <div
                        className="font-bold text-[14px]"
                        style={{ color: "var(--gmc-ink)" }}
                      >
                        {f.feature}
                      </div>
                      <GlossaryText
                        tag="div"
                        text={f.definition}
                        glossary={glossary}
                        className="text-[12px] mt-1 leading-relaxed"
                      />
                      <div className="mt-3 space-y-2">
                        {insurers.map((ins) => {
                          const entry = lookup[ins.id]?.[f.feature];
                          return (
                            <div
                              key={ins.id}
                              className="rounded-[10px] p-3 border"
                              style={{
                                background: hexToRgba(ins.accent, 0.05),
                                borderColor: "var(--gmc-line)",
                                borderLeftWidth: 3,
                                borderLeftColor: ins.accent || "var(--gmc-teal)",
                              }}
                            >
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <InsurerLogo insurer={ins} size={22} />
                                  <div
                                    className="text-[11px] font-bold uppercase tracking-[0.05em]"
                                    style={{ color: ins.accent || "var(--gmc-teal-mid)" }}
                                  >
                                    {ins.name}
                                  </div>
                                </div>
                                <VerifiedIcon verified={entry?.verified} />
                              </div>
                              <div
                                className="text-[13px] font-semibold leading-snug"
                                style={{ color: "var(--gmc-ink-2)" }}
                              >
                                {entry?.short ? (
                                  <GlossaryText text={entry.short} glossary={glossary} />
                                ) : (
                                  <span
                                    className="italic font-normal"
                                    style={{ color: "var(--gmc-faint)" }}
                                  >
                                    Not extracted
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div
                        className="mt-3 text-[11px] font-bold uppercase tracking-[0.1em]"
                        style={{ color: "var(--gmc-teal-mid)" }}
                      >
                        Tap for full detail →
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
