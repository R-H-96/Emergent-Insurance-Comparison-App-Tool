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
// Approximate advance width of a label at 13px semibold Plus Jakarta Sans,
// plus the pill's horizontal padding. The label set is fixed and known, so an
// approximation is fine here.
const labelWidth = (label) => label.length * 7.15 + 18;

/**
 * Gap between the outer ring and a label, per axis.
 *
 * This was a constant 34 for every axis, which is why "Everyday care" sat on
 * the plot while "Cancer" floated. A side label is anchored at its end and
 * grows back TOWARD the chart, so the clearance it needs depends on its own
 * width and on how horizontal its axis is. cos of the angle is exactly that
 * horizontal component.
 *
 * Tuned so every label box clears the plot circle by at least 16px, measured
 * against the circle rather than eyeballed. That produces offsets of 33 to 46
 * across the six axes, where a single constant could only ever be right for
 * one of them. Minimum clearance lands on "Waiting periods", the vertical
 * label, whose tall pill needs the base value alone to carry it.
 */
const labelOffset = (label, angleRad) =>
  33 + labelWidth(label) * Math.abs(Math.cos(angleRad)) * 0.13;

const axisAngle = (idx, count) => ((-90 + (idx * 360) / count) * Math.PI) / 180;

// Frame computed from where the labels actually land, not guessed. Every label
// box and the plot circle fit inside it with 10px to spare.
const VB = { ox: -102, oy: -22, w: 448, h: 298 };

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
          className="gmc-tap inline-flex items-center gap-1.5 gmc-t-sm gmc-w-strong mb-2"
          style={{ color: "var(--gmc-teal-mid)" }}
          onClick={() => setOpenTheme(null)}
          data-testid="radar-area-back"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
          Back
        </button>
      )}
      {isWide && (
        <div className="gmc-t-sm gmc-w-heavy mb-2" style={{ color: "var(--gmc-ink)" }}>
          {groupLabel(active.group)}
        </div>
      )}

      {areaFeatures.length === 0 ? (
        <p className="gmc-t-sm leading-relaxed" style={{ color: "var(--gmc-body)" }}>
          These policies don&apos;t differ notably in this area.
        </p>
      ) : (
        <div className="space-y-2.5">
          {areaFeatures.map((f) => (
            <div key={f.feature} className="py-3" style={{ borderTop: "1px solid var(--gmc-line)" }}>
              <button
                type="button"
                className="text-left w-full gmc-t-sm gmc-w-heavy leading-snug"
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
                    <span className="gmc-t-sm leading-snug" style={{ color: "var(--gmc-ink-2)" }}>
                      {entry?.short ? (
                        <GlossaryText text={entry.short} glossary={glossary} />
                      ) : (
                        <span style={{ color: "var(--gmc-muted)" }}>Not recorded</span>
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

  // No card. On a white page the border was drawing a box around a box: the
  // heading and the space already separate this from what is above it, and the
  // outline was what the chart's axis labels kept colliding with.
  return (
    <div className="py-2" data-testid="coverage-profile">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div
            className="gmc-t-lg sm:gmc-t-xl gmc-w-heavy"
            style={{ color: "var(--gmc-ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Coverage profile
          </div>
          <div className="gmc-t-sm mt-0.5" style={{ color: "var(--gmc-muted)" }}>
            A bigger shape means larger stated limits in that area.
          </div>
        </div>
        <InfoReveal
          title="Reading this chart"
          testId="radar-help"
          side="bottom"
          align="end"
          triggerClassName="gmc-tap flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0"
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

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-6 lg:gap-8 items-start mt-5">
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
              const label0 = groupShortLabel(t.group);
              const ang = axisAngle(i, N);
              const [px, py] = axisPoint(i, N, R + labelOffset(label0, ang));
              const ux = axisPoint(i, N, 1)[0] - CX;
              const anchor = ux > 4 ? "start" : ux < -4 ? "end" : "middle";
              const [hx, hy] = axisPoint(i, N, R);
              const isOpen = openTheme === t.id;
              const isPicked = highlightGroups.includes(t.group);
              const label = label0;
              const w = labelWidth(label);
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
                    /* Was teal-tint-2, which measures 1.09 against white and is
                       effectively invisible. Inverted instead: 5.9. */
                    fill={isOpen ? "var(--gmc-teal-deep)" : "transparent"}
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
                        ? "#FFFFFF"
                        : isPicked
                          ? "var(--gmc-teal-deep)"
                          : "var(--gmc-body)"
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
              className="absolute z-10 pointer-events-none rounded-[var(--gmc-r-ctl)] px-3 py-2 shadow-[0_8px_24px_rgba(22,28,39,0.16)]"
              style={{
                ...toPct(tipAnchor[0], tipAnchor[1]),
                transform: "translate(-50%, -110%)",
                background: "white",
                border: "1px solid var(--gmc-line)",
                minWidth: 150,
              }}
              data-testid="radar-tooltip"
            >
              <div className="gmc-t-xs gmc-w-heavy mb-1" style={{ color: "var(--gmc-ink)" }}>
                {groupLabel(tipTheme.group)}
              </div>
              {insurers.map((ins) => {
                const band = THEME_BANDS[ins.id]?.[tipTheme.id];
                const meta = BAND_META[band];
                return (
                  <div key={ins.id} className="flex items-center justify-between gap-3 gmc-t-xs py-0.5">
                    <span className="gmc-w-strong" style={{ color: ins.accent }}>{ins.name}</span>
                    <span className="gmc-w-strong" style={{ color: meta?.text }}>{meta?.label || "Not recorded"}</span>
                  </div>
                );
              })}
              <div className="gmc-t-xs mt-1" style={{ color: "var(--gmc-muted)" }}>
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
                    /* Same rule as the rows above: isolating one insurer is
                       already communicated by the others stepping back. No
                       fill, no rule, nothing added. */
                    opacity: isDim(ins.id) ? 0.35 : 1,
                  }}
                  onPointerEnter={() => setHoverInsurer(ins.id)}
                  onPointerLeave={() => setHoverInsurer(null)}
                  onClick={() => toggleFocus(ins.id)}
                  aria-pressed={on}
                  data-testid={`radar-legend-${ins.id}`}
                >
                  <InsurerMark insurer={ins} size={24} />
                  <span className="gmc-t-sm gmc-w-heavy" style={{ color: ins.accent || "var(--gmc-ink)" }}>
                    {ins.name}
                  </span>
                </button>
              );
            })}
            {focusInsurer && (
              <button
                type="button"
                className="gmc-t-sm gmc-w-strong underline decoration-dotted underline-offset-2"
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
            <div>
              <div
                className="gmc-section-heading"
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
                    className="gmc-tap w-full text-left flex items-start gap-2.5 py-3 transition-all cursor-pointer focus:outline-none focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--gmc-teal)]"
                    style={{
                      /* Selection adds nothing. Isolating one insurer IS pushing
                         the others back, so the interface does exactly that and
                         no more. Two previous attempts here added a device on
                         top of a state that was already being communicated: an
                         inset rectangle, then a coloured left bar. Both were
                         decoration standing in for a state that the dimming had
                         already expressed. */
                      opacity: isDim(ins.id) ? 0.35 : 1,
                      borderTop: "1px solid var(--gmc-line)",
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
                        className="flex items-center gap-1.5 gmc-t-base gmc-w-strong"
                        style={{ color: "var(--gmc-ink)" }}
                      >
                        {ins.name}
                        <TierBadge band={so.band} />
                      </span>
                      <span className="block gmc-t-base leading-snug mt-0.5" style={{ color: "var(--gmc-body)" }}>
                        Largest stated limits in {so.groups.map(groupLabel).join(", ")}
                      </span>
                    </span>
                  </div>
                );
              })}

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

      {/* Two paragraphs of caveat were taking more vertical space than the
          chart's own legend. They are not equal, though: one is an instruction
          and a methodology note, the other carries the material claim. The
          instruction moved into the info button. What stays visible is the bit
          that matters if anyone ever asks what this chart is asserting.
          NOT a compliance judgement on my part: the full text is one tap away
          and unchanged, but an adviser should confirm the split. */}
      <p className="mt-3 gmc-t-xs leading-relaxed" style={{ color: "var(--gmc-muted)" }}>
        A factual orientation, not a recommendation.{" "}
        <InfoReveal
          title="How to read this chart"
          testId="radar-method"
          side="top"
          align="start"
          triggerClassName="underline decoration-dotted underline-offset-2 hover:decoration-solid"
          triggerStyle={{ color: "var(--gmc-teal-deep)" }}
          ariaLabel="How this chart is measured"
          body={
            <>
              Reach reflects the size and breadth of each insurer&apos;s stated limits by
              area. A wider shape isn&apos;t automatically better for your situation.
              <br /><br />
              Each policy is measured against its own other areas here, not against the
              other insurers.
              <br /><br />
              Tap an insurer to isolate it, or an area on the chart to read the wording.
            </>
          }
        >
          How this is measured
        </InfoReveal>
      </p>
    </div>
  );
}
