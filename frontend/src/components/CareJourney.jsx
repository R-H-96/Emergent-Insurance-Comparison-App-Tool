import { User, Search, Scissors, HeartPulse, RotateCcw } from "lucide-react";
import InsurerMark from "@/components/InsurerMark";
import TierBadge from "@/components/TierBadge";
import { JOURNEY_STAGES, RADAR_THEMES, leadersForTheme } from "@/data/glanceModel";

const ICONS = {
  user: User,
  search: Search,
  scissors: Scissors,
  heart: HeartPulse,
  refresh: RotateCcw,
};

const themeLabel = (id) => RADAR_THEMES.find((t) => t.id === id)?.label || id;

/**
 * Care-journey strip: the same limits laid along a real health journey.
 * At each stage we mark whichever selected insurer(s) hold the largest
 * stated limit for that area (a fact, from THEME_BANDS).
 */
export default function CareJourney({ insurers }) {
  return (
    <div className="gmc-card p-5 sm:p-6" data-testid="care-journey">
      <div className="flex items-baseline gap-2 mb-4 flex-wrap">
        <div className="text-[13px] sm:text-[14px] font-extrabold" style={{ color: "var(--gmc-ink)" }}>
          Along the care journey
        </div>
        <span className="text-[12px]" style={{ color: "var(--gmc-muted)" }}>
          — who holds the largest limit at each step
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {JOURNEY_STAGES.map((stage) => {
          const Icon = ICONS[stage.icon] || User;
          const { band, leaders, tied } = leadersForTheme(stage.theme, insurers);
          return (
            <div key={stage.id} className="text-center" data-testid={`journey-${stage.id}`}>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center mx-auto mb-2"
                style={{ background: "var(--gmc-bg-alt)", border: "1px solid var(--gmc-line)" }}
              >
                <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: "var(--gmc-teal-deep)" }} />
              </div>
              <div className="text-[11px] font-bold mb-1.5" style={{ color: "var(--gmc-ink)" }}>
                {stage.label}
              </div>
              {tied ? (
                <div className="text-[10.5px]" style={{ color: "var(--gmc-faint)" }}>
                  Similar
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex flex-wrap items-center justify-center gap-0.5">
                    {leaders.map((ins) => (
                      <InsurerMark key={ins.id} insurer={ins} size={18} />
                    ))}
                  </div>
                  <TierBadge band={band} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[11px] leading-relaxed italic" style={{ color: "var(--gmc-faint)" }}>
        &ldquo;Largest limit&rdquo; reflects the stated wording for that area only — it doesn&apos;t
        account for excess, price, or your own health needs.
      </p>
    </div>
  );
}
