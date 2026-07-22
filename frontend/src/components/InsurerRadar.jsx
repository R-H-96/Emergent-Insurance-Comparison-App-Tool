import { useState } from "react";
import { ShieldPlus, Ribbon, Stethoscope, DoorOpen, PlusCircle, Award } from "lucide-react";
import InsurerMark from "@/components/InsurerMark";
import { RADAR_THEMES, THEME_BANDS, BAND_META, bandToScore, standoutThemes } from "@/data/glanceModel";

/**
 * "Coverage profile" — interactive radar hero.
 *  • Each selected insurer is a shape across the six RADAR_THEMES.
 *  • Hover an insurer (shape / legend / summary) to isolate it.
 *  • Hover a vertex for the per-insurer band tooltip.
 *  • Click a vertex/label to jump to that theme in the full comparison.
 *  • Rings are labelled Standard / Higher / Highest.
 *  • A side panel summarises each insurer's broadest areas (factual).
 */

const THEME_ICONS = {
  core: ShieldPlus,
  cancer: Ribbon,
  specialists: Stethoscope,
  access: DoorOpen,
  extras: PlusCircle,
  loyalty: Award,
};

const CX = 130;
const CY = 126;
const R = 82;
const VB = { ox: -54, oy: -18, w: 368, h: 300 };

function hexToRgba(hex, a) {
  if (!hex || hex[0] !== "#") return `rgba(20,181,175,${a})`;
  const h = hex.slice(1);
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

function axisPoint(idx, count, radius) {
  const ang = ((-90 + (idx * 360) / count) * Math.PI) / 180;
  return [CX + radius * Math.cos(ang), CY + radius * Math.sin(ang)];
}

const toPct = (x, y) => ({
  left: `${((x - VB.ox) / VB.w) * 100}%`,
  top: `${((y - VB.oy) / VB.h) * 100}%`,
});

export default function InsurerRadar({ insurers, onOpenTheme }) {
  const themes = RADAR_THEMES;
  const N = themes.length;
  const [hoverInsurer, setHoverInsurer] = useState(null);
  const [hoverTheme, setHoverTheme] = useState(null);

  const rings = [1 / 3, 2 / 3, 1].map((level) =>
    themes.map((_, i) => axisPoint(i, N, R * level).map((v) => v.toFixed(1)).join(",")).join(" "),
  );

  const shapes = insurers.map((ins) => {
    const bands = THEME_BANDS[ins.id] || {};
    const pts = themes
      .map((t, i) => axisPoint(i, N, R * bandToScore(bands[t.id])).map((v) => v.toFixed(1)).join(","))
      .join(" ");
    return { ins, pts, accent: ins.accent || "var(--gmc-teal)" };
  });

  const ringLabels = [
    { level: 1 / 3, label: "Standard" },
    { level: 2 / 3, label: "Higher" },
    { level: 1, label: "Highest" },
  ];

  const active = hoverTheme
    ? themes.find((t) => t.id === hoverTheme)
    : null;
  const tipAnchor = active ? axisPoint(themes.indexOf(active), N, R) : null;

  return (
    <div className="gmc-card p-5 sm:p-6" data-testid="coverage-profile">
      <div className="mb-1">
        <div className="text-[17px] sm:text-[19px] font-extrabold" style={{ color: "var(--gmc-ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Coverage profile
        </div>
        <div className="text-[12.5px] mt-0.5" style={{ color: "var(--gmc-muted)" }}>
          Each shape maps an insurer across six areas — a bigger reach means larger stated limits there.
        </div>
      </div>

      <div className="grid md:grid-cols-[1.15fr_0.85fr] gap-4 items-center mt-3">
        <div className="relative">
          <svg
            viewBox={`${VB.ox} ${VB.oy} ${VB.w} ${VB.h}`}
            className="w-full"
            style={{ maxWidth: 460, margin: "0 auto", display: "block" }}
            role="img"
            aria-label={`Coverage radar comparing ${insurers.map((i) => i.name).join(", ")}`}
          >
            {rings.map((pts, i) => (
              <polygon key={i} points={pts} fill="none" stroke="var(--gmc-line)" strokeWidth="1" />
            ))}
            {themes.map((_, i) => {
              const [x, y] = axisPoint(i, N, R);
              return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--gmc-line)" strokeWidth="1" />;
            })}

            {ringLabels.map((r, i) => (
              <text key={i} x={CX + 5} y={CY - R * r.level + 3} textAnchor="start" fontSize="9" fill="var(--gmc-faint)">
                {r.label}
              </text>
            ))}

            {shapes.map(({ ins, pts, accent }) => {
              const dim = hoverInsurer && hoverInsurer !== ins.id;
              return (
                <polygon
                  key={ins.id}
                  points={pts}
                  fill={hexToRgba(ins.accent, dim ? 0.03 : 0.14)}
                  stroke={accent}
                  strokeWidth={dim ? 1.25 : 2.25}
                  strokeOpacity={dim ? 0.35 : 1}
                  strokeLinejoin="round"
                  style={{ transition: "all .15s", cursor: "pointer" }}
                  onMouseEnter={() => setHoverInsurer(ins.id)}
                  onMouseLeave={() => setHoverInsurer(null)}
                  data-testid={`radar-shape-${ins.id}`}
                />
              );
            })}

            {themes.map((t, i) => {
              const Icon = THEME_ICONS[t.id];
              const [px, py] = axisPoint(i, N, R + 24);
              const ux = axisPoint(i, N, 1)[0] - CX;
              const anchor = ux > 4 ? "start" : ux < -4 ? "end" : "middle";
              const [hx, hy] = axisPoint(i, N, R);
              return (
                <g key={t.id} style={{ cursor: "pointer" }}
                   onMouseEnter={() => setHoverTheme(t.id)}
                   onMouseLeave={() => setHoverTheme(null)}
                   onClick={() => onOpenTheme && onOpenTheme(t.group)}>
                  <circle cx={hx} cy={hy} r="16" fill="transparent" />
                  <g transform={`translate(${px},${py})`} style={{ color: "var(--gmc-teal-deep)" }}>
                    {Icon && <Icon x={-8} y={-17} size={16} strokeWidth={2.1} />}
                    <text x={0} y={4} textAnchor={anchor} fontSize="12" fontWeight="700" fill="var(--gmc-muted)"
                          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {t.short}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {active && tipAnchor && (
            <div
              className="absolute z-10 pointer-events-none rounded-[10px] px-3 py-2 shadow-[0_8px_24px_rgba(22,28,39,0.16)]"
              style={{
                ...toPct(tipAnchor[0], tipAnchor[1]),
                transform: "translate(-50%, -110%)",
                background: "white",
                border: "1px solid var(--gmc-line)",
                minWidth: 150,
              }}
              data-testid="radar-tooltip"
            >
              <div className="text-[11px] font-extrabold mb-1" style={{ color: "var(--gmc-ink)" }}>{active.label}</div>
              {insurers.map((ins) => {
                const band = THEME_BANDS[ins.id]?.[active.id];
                const meta = BAND_META[band];
                return (
                  <div key={ins.id} className="flex items-center justify-between gap-3 text-[11px] py-0.5">
                    <span className="font-semibold" style={{ color: ins.accent }}>{ins.name}</span>
                    <span className="font-bold" style={{ color: meta?.text }}>{meta?.label || "—"}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-1">
            {insurers.map((ins) => (
              <button
                key={ins.id}
                type="button"
                className="flex items-center gap-1.5"
                style={{ opacity: hoverInsurer && hoverInsurer !== ins.id ? 0.4 : 1, transition: "opacity .15s" }}
                onMouseEnter={() => setHoverInsurer(ins.id)}
                onMouseLeave={() => setHoverInsurer(null)}
                data-testid={`radar-legend-${ins.id}`}
              >
                <InsurerMark insurer={ins} size={20} />
                <span className="text-[12px] font-extrabold" style={{ color: ins.accent || "var(--gmc-ink)" }}>{ins.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5" data-testid="radar-summary">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--gmc-muted)" }}>
            Broadest stated limits
          </div>
          {insurers.map((ins) => {
            const so = standoutThemes(ins.id);
            const meta = BAND_META[so.band];
            const dim = hoverInsurer && hoverInsurer !== ins.id;
            return (
              <div
                key={ins.id}
                className="flex items-start gap-2.5 rounded-[10px] p-2.5"
                style={{
                  background: "var(--gmc-bg-alt)",
                  borderLeft: `3px solid ${ins.accent || "var(--gmc-teal)"}`,
                  opacity: dim ? 0.4 : 1,
                  transition: "opacity .15s",
                }}
                onMouseEnter={() => setHoverInsurer(ins.id)}
                onMouseLeave={() => setHoverInsurer(null)}
              >
                <InsurerMark insurer={ins} size={22} />
                <div className="min-w-0">
                  <div className="text-[12.5px] font-extrabold" style={{ color: ins.accent || "var(--gmc-ink)" }}>{ins.name}</div>
                  <div className="text-[12px] leading-snug" style={{ color: "var(--gmc-body)" }}>
                    <span className="font-semibold" style={{ color: meta?.text }}>{meta?.label} limits</span> in {so.labels.join(", ")}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="text-[10.5px] italic leading-snug pt-1" style={{ color: "var(--gmc-faint)" }}>
            Tap an area on the chart to see those differences in full.
          </div>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed italic" style={{ color: "var(--gmc-faint)" }}>
        Reach reflects the size and breadth of each insurer&apos;s stated limits by area — a factual orientation, not a
        recommendation. A wider shape isn&apos;t automatically better for your situation.
      </p>
    </div>
  );
}
