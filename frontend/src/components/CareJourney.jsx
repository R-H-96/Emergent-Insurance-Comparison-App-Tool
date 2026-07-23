import { User, Search, Scissors, HeartPulse, RotateCcw } from "lucide-react";
import InsurerMark from "@/components/InsurerMark";
import TierBadge from "@/components/TierBadge";
import { JOURNEY_STAGES, BAND_META, leadersForTheme } from "@/data/glanceModel";

const ICONS = { user: User, search: Search, scissors: Scissors, heart: HeartPulse, refresh: RotateCcw };

export default function CareJourney({ insurers, lookup }) {
  return (
    <div className="gmc-card p-5 sm:p-6" data-testid="care-journey">
      <div className="mb-5">
        <div
          className="text-[17px] sm:text-[19px] font-extrabold"
          style={{ color: "var(--gmc-ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Across your health journey
        </div>
        <div className="text-[12.5px] mt-0.5" style={{ color: "var(--gmc-muted)" }}>
          Who holds the largest stated limit at each step, from everyday care to aftercare.
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
            <div key={stage.id} className="flex gap-3" data-testid={`journey-mobile-${stage.id}`}>
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
                  className="text-[14px] font-extrabold mb-1.5"
                  style={{ color: "var(--gmc-ink)" }}
                >
                  {stage.label}
                </div>
                {tied ? (
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ background: "var(--gmc-bg-alt)", color: "var(--gmc-faint)" }}
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
                    <TierBadge band={band} className="text-[12px] px-2.5 py-0.5" />
                    {leadValue && (
                      <span
                        className="text-[12px] leading-snug"
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
              <div key={stage.id} className="text-center" data-testid={`journey-${stage.id}`}>
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2.5"
                  style={{ background: "var(--gmc-card)", border: "2px solid var(--gmc-line)" }}
                >
                  <Icon className="w-5 h-5" strokeWidth={2.2} style={{ color: "var(--gmc-teal-deep)" }} />
                </div>
                <div
                  className="text-[14px] font-extrabold mb-2 tracking-tight"
                  style={{ color: "var(--gmc-ink)" }}
                >
                  {stage.label}
                </div>
                {tied ? (
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ background: "var(--gmc-bg-alt)", color: "var(--gmc-faint)" }}
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
                    <TierBadge band={band} className="text-[12.5px] px-3 py-1" />
                    {leadValue && (
                      <div
                        className="text-[12px] leading-snug mt-0.5 px-1"
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
          className="text-[11.5px] font-bold uppercase tracking-[0.08em]"
          style={{ color: "var(--gmc-muted)" }}
        >
          Limit size
        </span>
        {[1, 2, 3].map((b) => (
          <span key={b} className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--gmc-body)" }}>
            <span
              className="inline-block w-3.5 h-3.5 rounded-sm flex-shrink-0"
              style={{ background: BAND_META[b].fill }}
            />
            {BAND_META[b].label}
          </span>
        ))}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed italic" style={{ color: "var(--gmc-faint)" }}>
        &ldquo;Largest limit&rdquo; reflects the stated wording for that area only — it doesn&apos;t account for excess,
        price, or your own health needs.
      </p>
    </div>
  );
}
