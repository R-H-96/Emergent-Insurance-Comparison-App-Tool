import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { VerifiedIcon } from "@/components/VerifiedBadge";

/**
 * Comparison table. Two modes:
 *  - Desktop (>= md): CSS grid, stretches to container width, no horizontal scroll.
 *  - Mobile (< md): each feature renders as a stacked card with per-insurer sections.
 *
 * Cells show ONLY the `short` value + a tiny verified/pending icon.
 * Clicking a row/cell opens the detail modal (via `onOpenFeature`).
 * Groups collapsed by default except "Core limits" (per spec).
 */
export default function ComparisonTable({
  insurers,
  features,
  data,
  diffOnly,
  activeGroups,
  onOpenFeature,
}) {
  // Order-preserving group map
  const grouped = useMemo(() => {
    const g = new Map();
    features.forEach((f) => {
      if (!g.has(f.group)) g.set(f.group, []);
      g.get(f.group).push(f);
    });
    return Array.from(g.entries());
  }, [features]);

  // Default: only "Core limits" open
  const [collapsed, setCollapsed] = useState(() => {
    const s = new Set();
    grouped.forEach(([group]) => {
      if (group !== "Core limits") s.add(group);
    });
    return s;
  });

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

  // Apply filters: group filter + diff-only (notable) filter
  const visibleGrouped = grouped
    .filter(([group]) =>
      activeGroups.length === 0 ? true : activeGroups.includes(group),
    )
    .map(([group, feats]) => {
      const visible = diffOnly ? feats.filter((f) => f.notable) : feats;
      return [group, feats, visible];
    })
    .filter(([, , visible]) => visible.length > 0);

  if (!visibleGrouped.length) {
    return (
      <div
        className="gmc-card p-10 text-center"
        data-testid="comparison-empty"
      >
        <p style={{ color: "var(--gmc-body)" }}>
          No features match your current filters.
        </p>
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
          {insurers.map((ins) => (
            <div
              key={ins.id}
              className="p-4"
              style={{ borderLeft: "1px solid var(--gmc-line)" }}
              data-testid={`header-${ins.id}`}
            >
              <div
                className="font-extrabold text-[15px]"
                style={{ color: "var(--gmc-ink)" }}
              >
                {ins.name}
              </div>
              <div
                className="text-[12px] font-semibold mt-0.5"
                style={{ color: "var(--gmc-teal-mid)" }}
              >
                {ins.product}
              </div>
              <div
                className="text-[11px] mt-0.5 leading-snug"
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
                    · {visibleFeats.length} row
                    {visibleFeats.length === 1 ? "" : "s"}
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
                visibleFeats.map((f) => (
                  <div
                    key={f.feature}
                    className="grid group cursor-pointer transition-colors hover:bg-[color:var(--gmc-teal-tint)]"
                    style={{
                      gridTemplateColumns: gridTemplate,
                      borderBottom: "1px solid var(--gmc-line)",
                      background: f.notable
                        ? "var(--gmc-teal-tint)"
                        : "var(--gmc-card)",
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
                      <div
                        className="text-[12px] mt-1 leading-relaxed"
                        style={{ color: "var(--gmc-muted)" }}
                      >
                        {f.definition}
                      </div>
                    </div>
                    {insurers.map((ins) => {
                      const entry = lookup[ins.id]?.[f.feature];
                      return (
                        <div
                          key={ins.id}
                          className="p-4 flex items-start gap-2"
                          style={{ borderLeft: "1px solid var(--gmc-line)" }}
                          data-testid={`cell-${ins.id}-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                        >
                          <div
                            className="text-[13px] font-semibold leading-snug flex-1"
                            style={{ color: "var(--gmc-ink-2)" }}
                          >
                            {entry?.short || (
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
                ))}
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
                className="w-full flex items-center gap-2 p-4 text-left"
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
                visibleFeats.map((f) => (
                  <div
                    key={f.feature}
                    className="p-4 border-t cursor-pointer"
                    style={{
                      borderColor: "var(--gmc-line)",
                      background: f.notable
                        ? "var(--gmc-teal-tint)"
                        : "var(--gmc-card)",
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
                    <div
                      className="text-[12px] mt-1 leading-relaxed"
                      style={{ color: "var(--gmc-muted)" }}
                    >
                      {f.definition}
                    </div>
                    <div className="mt-3 space-y-2">
                      {insurers.map((ins) => {
                        const entry = lookup[ins.id]?.[f.feature];
                        return (
                          <div
                            key={ins.id}
                            className="rounded-[10px] p-3 border"
                            style={{
                              background: "var(--gmc-card)",
                              borderColor: "var(--gmc-line)",
                            }}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div
                                className="text-[11px] font-bold uppercase tracking-[0.05em]"
                                style={{ color: "var(--gmc-teal-mid)" }}
                              >
                                {ins.name}
                              </div>
                              <VerifiedIcon verified={entry?.verified} />
                            </div>
                            <div
                              className="text-[13px] font-semibold leading-snug"
                              style={{ color: "var(--gmc-ink-2)" }}
                            >
                              {entry?.short || (
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
                ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
