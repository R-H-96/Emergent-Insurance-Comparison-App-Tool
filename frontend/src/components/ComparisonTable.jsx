import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

function Badge({ verified }) {
  if (verified === "verified" || (typeof verified === "string" && verified.startsWith("verified"))) {
    // format: "verified" or "verified 2026-07-18"
    const parts = verified.split(" ");
    const date = parts.length > 1 ? parts.slice(1).join(" ") : "";
    return (
      <span className="gmc-badge-verified" data-testid="badge-verified">
        ✓ Verified{date ? ` ${date}` : ""}
      </span>
    );
  }
  return (
    <span className="gmc-badge-pending" data-testid="badge-pending">
      Pending verification
    </span>
  );
}

function Cell({ entry }) {
  if (!entry) {
    return (
      <div
        className="text-xs italic"
        style={{ color: "var(--gmc-faint)" }}
      >
        Not extracted
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <p
        className="text-sm leading-relaxed"
        style={{ color: "var(--gmc-ink-2)", fontWeight: 500 }}
      >
        {entry.value}
      </p>
      <p
        className="text-[12px] leading-snug"
        style={{ color: "var(--gmc-muted)" }}
      >
        {entry.source}
      </p>
      <div>
        <Badge verified={entry.verified} />
      </div>
    </div>
  );
}

export default function ComparisonTable({ insurers, features, data, diffOnly }) {
  // Group features preserving order
  const grouped = useMemo(() => {
    const g = new Map();
    features.forEach((f) => {
      if (!g.has(f.group)) g.set(f.group, []);
      g.get(f.group).push(f);
    });
    return Array.from(g.entries());
  }, [features]);

  const [collapsed, setCollapsed] = useState(new Set());

  // Build a lookup: insurerId -> featureName -> entry
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

  const isDifferent = (featureName) => {
    const values = insurers.map((ins) => lookup[ins.id]?.[featureName]?.value || "");
    const first = values[0];
    return values.some((v) => v !== first);
  };

  const toggleGroup = (group) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const cols = insurers.length;
  const gridTemplate = `minmax(240px, 1.2fr) repeat(${cols}, minmax(240px, 1fr))`;

  return (
    <div
      className="gmc-card overflow-hidden"
      data-testid="comparison-table"
    >
      <div className="overflow-x-auto thin-scrollbar">
        <div style={{ minWidth: 720 + cols * 240 }}>
          {/* Header row */}
          <div
            className="grid sticky top-0 z-10 bg-white"
            style={{
              gridTemplateColumns: gridTemplate,
              borderBottom: "1px solid var(--gmc-line)",
            }}
          >
            <div className="p-4 gmc-eyebrow" style={{ background: "var(--gmc-card)" }}>
              Feature
            </div>
            {insurers.map((ins) => (
              <div
                key={ins.id}
                className="p-4"
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
                  className="text-[11px] mt-0.5"
                  style={{ color: "var(--gmc-muted)" }}
                >
                  {ins.version}
                </div>
              </div>
            ))}
          </div>

          {/* Groups */}
          {grouped.map(([group, groupFeatures]) => {
            const isCollapsed = collapsed.has(group);
            const visibleFeatures = diffOnly
              ? groupFeatures.filter((f) => isDifferent(f.feature))
              : groupFeatures;

            if (diffOnly && visibleFeatures.length === 0) return null;

            return (
              <div key={group} data-testid={`group-${group}`}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  className="w-full grid text-left"
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
                      · {visibleFeatures.length} row{visibleFeatures.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {insurers.map((ins) => (
                    <div key={ins.id} className="p-3" />
                  ))}
                </button>

                {!isCollapsed &&
                  visibleFeatures.map((f) => {
                    const diff = isDifferent(f.feature);
                    return (
                      <div
                        key={f.feature}
                        className="grid"
                        style={{
                          gridTemplateColumns: gridTemplate,
                          borderBottom: "1px solid var(--gmc-line)",
                          background: diff
                            ? "var(--gmc-teal-tint)"
                            : "var(--gmc-card)",
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
                        {insurers.map((ins) => (
                          <div
                            key={ins.id}
                            className="p-4"
                            style={{
                              borderLeft: "1px solid var(--gmc-line)",
                            }}
                            data-testid={`cell-${ins.id}-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                          >
                            <Cell entry={lookup[ins.id]?.[f.feature]} />
                          </div>
                        ))}
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
