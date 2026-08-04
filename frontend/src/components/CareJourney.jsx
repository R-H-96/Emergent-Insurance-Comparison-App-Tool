import { User, Search, Scissors, HeartPulse, RotateCcw, ChevronRight } from "lucide-react";
import InsurerMark from "@/components/InsurerMark";
import TierBadge from "@/components/TierBadge";
import { JOURNEY_STAGES, BAND_META, leadersForTheme } from "@/data/glanceModel";

const ICONS = { user: User, search: Search, scissors: Scissors, heart: HeartPulse, refresh: RotateCcw };

/**
 * Each stage maps to exactly one feature (stage.headline), so tapping a stage
* goes straight to that feature's full detail, no intermediate panel, unlike
 * the radar, whose axes each cover a whole group.
 *
 * Making the stages open matters beyond convenience: the timeline shows only
 * the LEADING insurer's value at each step and hides the others, which is a
 * ranking-shaped presentation. One tap has to reveal all three policies' actual
 * wording, or the summary is the only thing a reader ever sees.
 */
export default function CareJourney({ insurers, lookup, onOpen }) {
  return (
    <div className="gmc-card p-5 sm:p-6" data-testid="care-journey">
      <div className="mb-5">
        <div
          className="gmc-t-lg sm:gmc-t-xl gmc-w-heavy"
          style={{ color: "var(--gmc-ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Across your health journey
        </div>
        <div className="gmc-t-sm mt-0.5" style={{ color: "var(--gmc-muted)" }}>
          Who holds the largest stated limit at each step, from everyday care to staying
          covered. Tap any step to see what all three policies say.
        </div>
      </div>

      {/* Mobile: vertical timeline */}
      <div className="sm:hidden">
        {JOURNEY_STAGES.map((stage, idx) => {
          const Icon = ICONS[stage.icon] || User;
          const { band, leaders, tied } = leadersForTheme(stage.theme, insurers);
          const leadValue = !tied && leaders[0] ? lookup?.[leaders[0].id]?.[stage.headline]?.short : null;
          const isLast = idx === JOURNEY_STAGES.length - 1;
          return (
            <div
              key={stage.id}
              role={onOpen ? "button" : undefined}
              tabIndex={onOpen ? 0 : undefined}
              onClick={() => onOpen && onOpen(stage.headline)}
              onKeyDown={(e) => {
                if (!onOpen) return;
                if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(stage.headline); }
              }}
              className={`flex gap-3 rounded-[var(--gmc-r-ctl)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gmc-teal)] ${
                onOpen ? "cursor-pointer hover:bg-[color:var(--gmc-teal-tint)]" : ""
              }`}
              data-testid={`journey-mobile-${stage.id}`}
            >
              {/* Timeline column: icon + connector */}
              <div className="flex flex-col items-center w-10 flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "var(--gmc-card)",
                    border: "2px solid var(--gmc-line)",
                    zIndex: 1,
                  }}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: "var(--gmc-teal-deep)" }} />
                </div>
                {!isLast && (
                  <div
                    className="w-[2px] flex-1 min-h-[20px] my-1"
                    style={{ background: "var(--gmc-line)" }}
                    aria-hidden="true"
                  />
                )}
              </div>

              {/* Content column */}
              <div className={`flex-1 pt-1.5 ${isLast ? "" : "pb-4"}`}>
                <div
                  className="flex items-center gap-1 gmc-t-base gmc-w-heavy mb-1.5"
                  style={{ color: "var(--gmc-ink)" }}
                >
                  <span>{stage.label}</span>
                  {onOpen && (
                    <ChevronRight
                      className="w-3.5 h-3.5 flex-shrink-0"
                      strokeWidth={2.4}
                      style={{ color: "var(--gmc-muted)" }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                {tied ? (
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 gmc-t-xs gmc-w-strong"
                    style={{ background: "var(--gmc-bg-alt)", color: "var(--gmc-muted)" }}
                  >
                    Comparable
                  </span>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      {leaders.map((ins) => (
                        <InsurerMark key={ins.id} insurer={ins} size={22} />
                      ))}
                    </div>
                    <TierBadge band={band} className="gmc-t-sm px-2.5 py-0.5" />
                    {leadValue && (
                      <span
                        className="gmc-t-sm leading-snug"
                        style={{ color: "var(--gmc-body)" }}
                      >
                        {leadValue}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: horizontal 5-column grid */}
      <div className="hidden sm:block relative">
        <div
          className="absolute"
          style={{ top: 24, left: "10%", right: "10%", height: 2, background: "var(--gmc-line)", zIndex: 0 }}
          aria-hidden="true"
        />
        <div className="relative grid grid-cols-5 gap-2" style={{ zIndex: 1 }}>
          {JOURNEY_STAGES.map((stage) => {
            const Icon = ICONS[stage.icon] || User;
            const { band, leaders, tied } = leadersForTheme(stage.theme, insurers);
            const leadValue = !tied && leaders[0] ? lookup?.[leaders[0].id]?.[stage.headline]?.short : null;
            return (
              <div
                key={stage.id}
                role={onOpen ? "button" : undefined}
                tabIndex={onOpen ? 0 : undefined}
                onClick={() => onOpen && onOpen(stage.headline)}
                onKeyDown={(e) => {
                  if (!onOpen) return;
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(stage.headline); }
                }}
                className={`text-center rounded-[var(--gmc-r-ctl)] py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gmc-teal)] ${
                  onOpen ? "cursor-pointer hover:bg-[color:var(--gmc-teal-tint)]" : ""
                }`}
                data-testid={`journey-${stage.id}`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2.5"
                  style={{ background: "var(--gmc-card)", border: "2px solid var(--gmc-line)" }}
                >
                  <Icon className="w-5 h-5" strokeWidth={2.2} style={{ color: "var(--gmc-teal-deep)" }} />
                </div>
                <div
                  className="flex items-center justify-center gap-1 gmc-t-base gmc-w-heavy mb-2 tracking-tight"
                  style={{ color: "var(--gmc-ink)" }}
                >
                  <span>{stage.label}</span>
                  {onOpen && (
                    <ChevronRight
                      className="w-3.5 h-3.5 flex-shrink-0"
                      strokeWidth={2.4}
                      style={{ color: "var(--gmc-muted)" }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                {tied ? (
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 gmc-t-xs gmc-w-strong"
                    style={{ background: "var(--gmc-bg-alt)", color: "var(--gmc-muted)" }}
                  >
                    Comparable
                  </span>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {leaders.map((ins) => (
                        <InsurerMark key={ins.id} insurer={ins} size={24} />
                      ))}
                    </div>
                    <TierBadge band={band} className="gmc-t-sm px-3 py-1" />
                    {leadValue && (
                      <div
                        className="gmc-t-sm leading-snug mt-0.5 px-1"
                        style={{ color: "var(--gmc-body)" }}
                      >
                        {leadValue}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="flex items-center flex-wrap gap-x-5 gap-y-1.5 mt-5 pt-3.5 border-t"
        style={{ borderColor: "var(--gmc-line)" }}
      >
        <span
          className="gmc-t-xs gmc-w-strong uppercase tracking-[0.08em]"
          style={{ color: "var(--gmc-muted)" }}
        >
          Limit size
        </span>
        {[1, 2, 3].map((b) => (
          <span key={b} className="flex items-center gap-1.5 gmc-t-sm" style={{ color: "var(--gmc-body)" }}>
            <span
              className="inline-block w-3.5 h-3.5 rounded-[var(--gmc-r-ctl)] flex-shrink-0"
              style={{ background: BAND_META[b].fill }}
            />
            {BAND_META[b].label}
          </span>
        ))}
      </div>

      <p className="mt-3 gmc-t-xs leading-relaxed italic" style={{ color: "var(--gmc-muted)" }}>
&ldquo;Largest limit&rdquo; reflects the stated wording for that area only, it doesn&apos;t account for excess,
        price, or your own health needs.
      </p>
    </div>
  );
}
