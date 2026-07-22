import InsurerMark from "@/components/InsurerMark";
import { RADAR_THEMES, THEME_BANDS, bandToScore } from "@/data/glanceModel";

/**
 * Hero radar: each selected insurer is drawn as a shape across the six
 * RADAR_THEMES. Distance from centre = how large/broad that insurer's stated
 * limits are in that area (see compliance note in glanceModel.js).
 *
 * Geometry is computed for N axes so it works for 2–3 insurers unchanged.
 */
function hexToRgba(hex, a) {
  if (!hex || hex[0] !== "#") return `rgba(20,181,175,${a})`;
  const h = hex.slice(1);
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const CX = 130;
const CY = 122;
const R = 90;

function axisPoint(idx, count, radius) {
  const ang = ((-90 + (idx * 360) / count) * Math.PI) / 180;
  return [CX + radius * Math.cos(ang), CY + radius * Math.sin(ang)];
}

function polyPoints(scores) {
  return scores
    .map((s, i) => axisPoint(i, scores.length, R * s).map((v) => v.toFixed(1)).join(","))
    .join(" ");
}

export default function InsurerRadar({ insurers }) {
  const themes = RADAR_THEMES;
  const N = themes.length;

  const rings = [1 / 3, 2 / 3, 1].map((level) =>
    themes.map((_, i) => axisPoint(i, N, R * level).map((v) => v.toFixed(1)).join(",")).join(" "),
  );

  const labels = themes.map((t, i) => {
    const [x, y] = axisPoint(i, N, R + 16);
    const [ux] = axisPoint(i, N, 1);
    const anchor = ux - CX > 4 ? "start" : ux - CX < -4 ? "end" : "middle";
    return { label: t.short, x, y: y + 3, anchor };
  });

  const shapes = insurers.map((ins) => {
    const bands = THEME_BANDS[ins.id] || {};
    const scores = themes.map((t) => bandToScore(bands[t.id]));
    return { ins, points: polyPoints(scores), accent: ins.accent || "var(--gmc-teal)" };
  });

  return (
    <div className="gmc-card p-5 sm:p-6" data-testid="insurer-radar">
      <div className="flex items-baseline gap-2 mb-1 flex-wrap">
        <div
          className="text-[13px] sm:text-[14px] font-extrabold"
          style={{ color: "var(--gmc-ink)" }}
        >
          The shape of each policy
        </div>
        <span className="text-[12px]" style={{ color: "var(--gmc-muted)" }}>
          — bigger reach = larger stated limits in that area
        </span>
      </div>

      <div className="flex flex-col items-center">
        <svg
          viewBox="-8 -8 276 262"
          className="w-full"
          style={{ maxWidth: 380 }}
          role="img"
          aria-label={`Radar comparing ${insurers.map((i) => i.name).join(", ")} across ${themes.map((t) => t.label).join(", ")}`}
        >
          {rings.map((pts, i) => (
            <polygon key={i} points={pts} fill="none" stroke="var(--gmc-line)" strokeWidth="1" />
          ))}
          {themes.map((_, i) => {
            const [x, y] = axisPoint(i, N, R);
            return (
              <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="var(--gmc-line)" strokeWidth="1" />
            );
          })}
          {shapes.map(({ ins, points, accent }) => (
            <polygon
              key={ins.id}
              points={points}
              fill={hexToRgba(ins.accent, 0.12)}
              stroke={accent}
              strokeWidth="2"
              strokeLinejoin="round"
              data-testid={`radar-shape-${ins.id}`}
            />
          ))}
          {labels.map((l, i) => (
            <text
              key={i}
              x={l.x}
              y={l.y}
              textAnchor={l.anchor}
              fontSize="11"
              fontWeight="700"
              fill="var(--gmc-muted)"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {l.label}
            </text>
          ))}
        </svg>

        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-1">
          {insurers.map((ins) => (
            <div key={ins.id} className="flex items-center gap-1.5">
              <InsurerMark insurer={ins} size={20} />
              <span
                className="text-[12px] font-extrabold"
                style={{ color: ins.accent || "var(--gmc-ink)" }}
              >
                {ins.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed italic" style={{ color: "var(--gmc-faint)" }}>
        Reach reflects the size and breadth of each insurer&apos;s stated limits by area — a factual
        orientation, not a recommendation. A wider shape isn&apos;t automatically better for your situation.
      </p>
    </div>
  );
}
