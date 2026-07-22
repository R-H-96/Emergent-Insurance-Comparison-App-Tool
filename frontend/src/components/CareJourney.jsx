import { User, Search, Scissors, HeartPulse, RotateCcw } from "lucide-react";
import InsurerMark from "@/components/InsurerMark";
import TierBadge from "@/components/TierBadge";
import { JOURNEY_STAGES, BAND_META, leadersForTheme } from "@/data/glanceModel";

const ICONS = { user: User, search: Search, scissors: Scissors, heart: HeartPulse, refresh: RotateCcw };

/**
 * Care-journey strip: the same limits laid along a real health journey, from
 * everyday cover through to aftercare. Each stage marks whichever selected
 * insurer(s) hold the largest stated limit for that area, plus the headline
 * value behind it. Stages are linked as a path.
 */
export default function CareJourney({ insurers, lookup }) {
  return (
    <div className="gmc-card p-5 sm:p-6" data-testid="care-journey">
      <div className="mb-4">
        <div className="text-[17px] sm:text-[19px] font-extrabold" style={{ color: "var(--gmc-ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Across your health journey
        </div>
        <div className="text-[12.5px] mt-0.5" style={{ color: "var(--gmc-muted)" }}>
          Who holds the largest stated limit at each step, from everyday care to aftercare.
        </div>
      </div>

      <div className="relative">
        <div
          className="absolute hidden sm:block"
          style={{ top: 18, left: "10%", right: "10%", height: 2, background: "var(--gmc-line)", zIndex: 0 }}
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
                  className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ background: "var(--gmc-card)", border: "1.5px solid var(--gmc-line)" }}
                >
                  <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: "var(--gmc-teal-deep)" }} />
                </div>
                <div className="text-[12.5px] font-bold mb-1.5" style={{ color: "var(--gmc-ink)" }}>{stage.label}</div>
                {tied ? (
                  <div className="text-[11px]" style={{ color: "var(--gmc-faint)" }}>Comparable</div>
                ) : (
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex flex-wrap items-center justify-center gap-0.5">
                      {leaders.map((ins) => (
                        <InsurerMark key={ins.id} insurer={ins} size={18} />
                      ))}
                    </div>
                    <TierBadge band={band} />
                    {leadValue && (
                      <div className="text-[10.5px] leading-tight mt-0.5" style={{ color: "var(--gmc-muted)" }}>
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

      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-5 pt-3 border-t" style={{ borderColor: "var(--gmc-line)" }}>
        <span className="text-[10.5px] font-bold uppercase tracking-[0.08em]" style={{ color: "var(--gmc-muted)" }}>
          Limit size
        </span>
        {[1, 2, 3].map((b) => (
          <span key={b} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--gmc-body)" }}>
            <span className="inline-block w-3 h-3 rounded" style={{ background: BAND_META[b].fill }} />
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
