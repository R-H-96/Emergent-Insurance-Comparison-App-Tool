import { useState } from "react";
import { ChevronLeft, ArrowRight } from "lucide-react";
import InfoReveal from "@/components/InfoReveal";
import { Info } from "lucide-react";
import InsurerMark from "@/components/InsurerMark";
import GlossaryText from "@/components/GlossaryText";
import TierBadge from "@/components/TierBadge";
import MobileSheet from "@/components/MobileSheet";
import useMediaQuery from "@/hooks/useMediaQuery";
import { RADAR_THEMES, THEME_BANDS, BAND_META, bandToScore, standoutThemes } from "@/data/glanceModel";
import { groupLabel, groupShortLabel } from "@/lib/personalisation";
import { isNotableForSelection } from "@/lib/notable";

const CX = 130;
const CY = 130;
const R = 92;
// Frame sized to the actual label extents rather than guessed at, so the plot
// fills as much of the width as the longest label allows. Every label position
// is checked against these bounds.
const LABEL_OFFSET = 34;
const VB = { ox: -89, oy: -19, w: 423, h: 292 };

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

/**
 * Coverage profile.
 *
 * Tapping an axis opens that area's actual policy wording. On a wide screen it
 * fills the side column; on a phone it arrives as a sheet, because a panel
 * below a full-width chart lands off the bottom of the screen and reads as
 * nothing having happened.
 *
 * Tapping an insurer isolates its shape. That is the per-insurer filter people
 * ask for, achieved by direct manipulation rather than another row of controls.
 */
export default function InsurerRadar({
  insurers, features = [], lookup = {}, glossary,
  highlightGroups = [], onOpenTheme, onOpenFeature,
}) {
  const themes = RADAR_THEMES;
  const N = themes.length;
  const [hoverInsurer, setHoverInsurer] = useState(null);
  const [focusInsurer, setFocusInsurer] = useState(null);
  const [hoverTheme, setHoverTheme] = useState(null);
  const [openTheme, setOpenTheme] = useState(null);
  const isWide = useMediaQuery("(min-width: 1024px)");

  const dimmed = focusInsurer || hoverInsurer;
  const isDim = (id) => !!dimmed && dimmed !== id;

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

  const tipTheme = !openTheme && hoverTheme ? themes.find((t) => t.id === hoverTheme) : null;
  const tipAnchor = tipTheme ? axisPoint(themes.indexOf(tipTheme), N, R) : null;

  const active = openTheme ? themes.find((t) => t.id === openTheme) : null;
  const areaFeatures = active
    ? features.filter((f) => f.group === active.group && isNotableForSelection(f, insurers, lookup))
    : [];

  const toggleTheme = (id) => setOpenTheme((cur) => (cur === id ? null : id));
  const toggleFocus = (id) => setFocusInsurer((cur) => (cur === id ? null : id));

  const AreaDetail = active ? (
    <div>
      {isWide && (
        <button
          type="button"
          className="gmc-tap inline-flex items-center gap-1.5 text-[13px] sm:text-[12px] font-bold mb-2"
          style={{ color: "var(--gmc-teal-mid)" }}
          onClick={() => setOpenTheme(null)}
          data-testid="radar-area-back"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
          Back
        </button>
      )}
      {isWide && (
        <div className="text-[14px] sm:text-[13px] font-extrabold mb-2" style={{ color: "var(--gmc-ink)" }}>
          {groupLabel(active.group)}
        </div>
      )}

      {areaFeatures.length === 0 ? (
        <p className="text-[14px] sm:text-[13px] leading-relaxed" style={{ color: "var(--gmc-body)" }}>
          These policies don&apos;t differ notably in this area.
        </p>
      ) : (
        <div className="space-y-2.5">
          {areaFeatures.map((f) => (
            <div key={f.feature} className="rounded-[10px] p-3" style={{ background: "var(--gmc-bg-alt)" }}>
              <button
                type="button"
                className="text-left w-full text-[14px] sm:text-[13px] font-extrabold leading-snug"
                style={{ color: "var(--gmc-ink)" }}
                onClick={() => onOpenFeature && onOpenFeature(f.feature)}
                data-testid={`radar-area-feature-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
              >
                {f.plain || f.feature}
              </button>
              {insurers.map((ins) => {
                const entry = lookup[ins.id]?.[f.feature];
                return (
                  <div key={ins.id} className="flex items-start gap-2 mt-2">
                    <InsurerMark insurer={ins} size={18} />
                    <span className="text-[13.5px] sm:text-[12.5px] leading-snug" style={{ color: "var(--gmc-ink-2)" }}>
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
          ))}
        </div>
      )}

      <button
        type="button"
        className="gmc-btn-outline gmc-tap w-full mt-3"
        onClick={() => { setOpenTheme(null); onOpenTheme && onOpenTheme(active.group); }}
        data-testid="radar-area-open-table"
      >
        See this section in full
        <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  ) : null;

  return (
    <div className="gmc-card p-4 sm:p-6" data-testid="coverage-profile">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div
            className="text-[18px] sm:text-[19px] font-extrabold"
            style={{ color: "var(--gmc-ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Coverage profile
          </div>
          <div className="text-[13.5px] sm:text-[12.5px] mt-0.5" style={{ color: "var(--gmc-muted)" }}>
            A bigger shape means larger stated limits in that area.
          </div>
        </div>
        <InfoReveal
          title="Reading this chart"
          testId="radar-help"
          side="bottom"
          align="end"
          triggerClassName="gmc-tap flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
          triggerStyle={{ background: "var(--gmc-bg-alt)" }}
          ariaLabel="How to read this chart"
          body={
            <>
              Each coloured shape is one insurer, mapped across six areas of cover. The
              further a shape reaches along an axis, the larger that policy&apos;s stated
              limits are in that area.
              <br /><br />
              Tap any area name to read the actual policy wording behind it. Tap an insurer
              to show only its shape.
              <br /><br />
              A wider shape is not automatically better for you. Excess, price and your own
              health needs all matter, and none of them appear here.
            </>
          }
        >
          <Info className="w-4 h-4" strokeWidth={2.2} style={{ color: "var(--gmc-teal-mid)" }} />
        </InfoReveal>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-4 items-start mt-3 -mx-2 sm:mx-0">
        <div className="relative">
          <svg
            viewBox={`${VB.ox} ${VB.oy} ${VB.w} ${VB.h}`}
            className="w-full"
            style={{ display: "block" }}
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

            {shapes.map(({ ins, pts, accent }) => {
              const dim = isDim(ins.id);
              return (
                <polygon
                  key={ins.id}
                  points={pts}
                  fill={hexToRgba(ins.accent, dim ? 0.03 : 0.14)}
                  stroke={accent}
                  strokeWidth={dim ? 1.25 : 2.25}
                  strokeOpacity={dim ? 0.35 : 1}
                  strokeLinejoin="round"
                  style={{ transition: "all .15s", cursor: "pointer", outline: "none" }}
                  onPointerEnter={() => setHoverInsurer(ins.id)}
                  onPointerLeave={() => setHoverInsurer(null)}
                  onClick={() => toggleFocus(ins.id)}
                  data-testid={`radar-shape-${ins.id}`}
                />
              );
            })}

            {themes.map((t, i) => {
              const [px, py] = axisPoint(i, N, R + LABEL_OFFSET);
              const ux = axisPoint(i, N, 1)[0] - CX;
              const anchor = ux > 4 ? "start" : ux < -4 ? "end" : "middle";
              const [hx, hy] = axisPoint(i, N, R);
              const isOpen = openTheme === t.id;
              const isPicked = highlightGroups.includes(t.group);
              const label = groupShortLabel(t.group);
              const w = label.length * 7.15 + 18;
              return (
                <g
                  key={t.id}
                  style={{ cursor: "pointer", outline: "none" }}
                  onPointerEnter={() => setHoverTheme(t.id)}
                  onPointerLeave={() => setHoverTheme(null)}
                  onClick={() => toggleTheme(t.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${groupLabel(t.group)}, show the wording`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleTheme(t.id); }
                  }}
                  data-testid={`radar-axis-${t.id}`}
                >
                  <circle cx={hx} cy={hy} r="22" fill="transparent" />
                  <circle
                    cx={hx}
                    cy={hy}
                    r="4"
                    fill={isOpen || isPicked ? "var(--gmc-teal)" : "var(--gmc-line)"}
                    style={{ transition: "fill .15s" }}
                  />
                  <rect
                    x={anchor === "start" ? px - 8 : anchor === "end" ? px - w + 8 : px - w / 2}
                    y={py - 17}
                    width={w}
                    height="28"
                    rx="14"
                    fill={isOpen ? "var(--gmc-teal-tint-2)" : "transparent"}
                    style={{ transition: "fill .15s" }}
                  />
                  <text
                    x={px}
                    y={py}
                    textAnchor={anchor}
                    fontSize="13"
                    fontWeight={isOpen || isPicked ? "800" : "700"}
                    fill={
                      isOpen
                        ? "var(--gmc-teal-deep)"
                        : isPicked
                          ? "var(--gmc-teal-mid)"
                          : "var(--gmc-muted)"
                    }
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {label}
                  </text>
                </g>
              );
            })}
          </svg>

          {tipTheme && tipAnchor && isWide && (
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
              <div className="text-[12px] sm:text-[11px] font-extrabold mb-1" style={{ color: "var(--gmc-ink)" }}>
                {groupLabel(tipTheme.group)}
              </div>
              {insurers.map((ins) => {
                const band = THEME_BANDS[ins.id]?.[tipTheme.id];
                const meta = BAND_META[band];
                return (
                  <div key={ins.id} className="flex items-center justify-between gap-3 text-[12px] sm:text-[11px] py-0.5">
                    <span className="font-semibold" style={{ color: ins.accent }}>{ins.name}</span>
                    <span className="font-bold" style={{ color: meta?.text }}>{meta?.label || "Not recorded"}</span>
                  </div>
                );
              })}
              <div className="text-[10px] mt-1" style={{ color: "var(--gmc-faint)" }}>
                Tap to read the wording
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 mt-2">
            {insurers.map((ins) => {
              const on = focusInsurer === ins.id;
              return (
                <button
                  key={ins.id}
                  type="button"
                  className="gmc-tap flex items-center gap-2 rounded-full pl-1 pr-2.5 py-1 transition-all"
                  style={{
                    opacity: isDim(ins.id) ? 0.4 : 1,
                    background: on ? "var(--gmc-teal-tint)" : "transparent",
                    boxShadow: on ? `inset 0 0 0 1.5px ${ins.accent}` : "none",
                  }}
                  onPointerEnter={() => setHoverInsurer(ins.id)}
                  onPointerLeave={() => setHoverInsurer(null)}
                  onClick={() => toggleFocus(ins.id)}
                  aria-pressed={on}
                  data-testid={`radar-legend-${ins.id}`}
                >
                  <InsurerMark insurer={ins} size={24} />
                  <span className="text-[14px] sm:text-[13px] font-extrabold" style={{ color: ins.accent || "var(--gmc-ink)" }}>
                    {ins.name}
                  </span>
                </button>
              );
            })}
            {focusInsurer && (
              <button
                type="button"
                className="text-[13px] sm:text-[12px] font-semibold underline decoration-dotted underline-offset-2"
                style={{ color: "var(--gmc-muted)" }}
                onClick={() => setFocusInsurer(null)}
                data-testid="radar-clear-focus"
              >
                Show all
              </button>
            )}
          </div>
        </div>

        <div data-testid="radar-summary">
          {active && isWide ? (
            AreaDetail
          ) : (
            <div className="space-y-2.5">
              <div
                className="text-[12px] sm:text-[11px] font-bold uppercase tracking-[0.08em]"
                style={{ color: "var(--gmc-muted)" }}
              >
                Where each policy states its largest limits
              </div>
              {insurers.map((ins) => {
                const so = standoutThemes(ins.id);
                const on = focusInsurer === ins.id;
                return (
                  <div
                    key={ins.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleFocus(ins.id); }
                    }}
                    className="gmc-tap w-full text-left flex items-start gap-2.5 rounded-[10px] p-2.5 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gmc-teal)]"
                    style={{
                      background: "var(--gmc-bg-alt)",
                      borderLeft: `3px solid ${ins.accent || "var(--gmc-teal)"}`,
                      opacity: isDim(ins.id) ? 0.4 : 1,
                      boxShadow: on ? `inset 0 0 0 1.5px ${ins.accent}` : "none",
                    }}
                    onPointerEnter={() => setHoverInsurer(ins.id)}
                    onPointerLeave={() => setHoverInsurer(null)}
                    onClick={() => toggleFocus(ins.id)}
                    aria-pressed={on}
                    data-testid={`radar-standout-${ins.id}`}
                  >
                    <InsurerMark insurer={ins} size={24} />
                    <span className="min-w-0">
                      <span
                        className="flex items-center gap-1.5 text-[13.5px] sm:text-[12.5px] font-extrabold"
                        style={{ color: ins.accent || "var(--gmc-ink)" }}
                      >
                        {ins.name}
                        <TierBadge band={so.band} />
                      </span>
                      <span className="block text-[13px] sm:text-[12px] leading-snug" style={{ color: "var(--gmc-body)" }}>
                        Largest stated limits in {so.groups.map(groupLabel).join(", ")}
                      </span>
                    </span>
                  </div>
                );
              })}
              <p className="text-[10.5px] leading-snug pt-1" style={{ color: "var(--gmc-faint)" }}>
                Each policy is measured against its own other areas here, not against the other
                insurers. Tap an insurer to isolate it, or an area on the chart to read the
                wording.
              </p>
            </div>
          )}
        </div>
      </div>

      {!isWide && (
        <MobileSheet
          open={!!active}
          onClose={() => setOpenTheme(null)}
          eyebrow="Coverage area"
          title={active ? groupLabel(active.group) : ""}
          testId="radar-area-sheet"
          scrollKey={openTheme || ""}
          maxHeight="min(78dvh, 640px)"
        >
          <div className="p-5">{AreaDetail}</div>
        </MobileSheet>
      )}

      <p className="mt-3 text-[12px] sm:text-[11px] leading-relaxed italic" style={{ color: "var(--gmc-faint)" }}>
        Reach reflects the size and breadth of each insurer&apos;s stated limits by area. A
        factual orientation, not a recommendation. A wider shape isn&apos;t automatically better
        for your situation.
      </p>
    </div>
  );
}
