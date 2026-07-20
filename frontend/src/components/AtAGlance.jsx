import { Sparkles } from "lucide-react";
import { VerifiedIcon } from "@/components/VerifiedBadge";
import GlossaryText from "@/components/GlossaryText";

/**
 * At-a-glance section: one card per notable feature. Cells show insurer's
 * short value + a mini accent stripe in the insurer's brand colour. The
 * feature's `why` line (if present) sits under the value grid.
 */
export default function AtAGlance({ features, insurers, lookup, glossary, onOpen }) {
  const notable = features.filter((f) => f.notable);
  if (!notable.length || !insurers.length) return null;

  return (
    <section className="pb-8 sm:pb-14" data-testid="at-a-glance">
      <div className="gmc-container">
        <div className="flex items-baseline gap-3 mb-1">
          <Sparkles
            className="w-4 h-4"
            strokeWidth={2.2}
            style={{ color: "var(--gmc-teal)" }}
          />
          <div className="gmc-eyebrow">At a glance · notable differences</div>
        </div>
        <h2 className="gmc-h2 text-2xl sm:text-3xl mb-6">
          The things people usually ask about
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notable.map((f) => (
            <button
              key={f.feature}
              type="button"
              onClick={() => onOpen(f.feature)}
              className="gmc-card p-5 sm:p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_44px_rgba(22,28,39,0.09)]"
              data-testid={`glance-card-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
            >
              <div
                className="font-extrabold text-[15px] leading-snug"
                style={{ color: "var(--gmc-ink)" }}
              >
                {f.feature}
              </div>
              <GlossaryText
                tag="p"
                text={f.definition}
                glossary={glossary}
                className="text-[12px] mt-1 leading-relaxed"
              />

              <div
                className="mt-4 grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${insurers.length}, minmax(0, 1fr))`,
                }}
              >
                {insurers.map((ins) => {
                  const entry = lookup[ins.id]?.[f.feature];
                  return (
                    <div
                      key={ins.id}
                      className="rounded-[10px] p-3 border relative overflow-hidden"
                      style={{
                        background: "var(--gmc-bg-alt)",
                        borderColor: "var(--gmc-line)",
                        borderLeftWidth: 3,
                        borderLeftColor: ins.accent || "var(--gmc-teal)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <div
                          className="text-[11px] font-bold uppercase tracking-[0.05em]"
                          style={{ color: ins.accent || "var(--gmc-teal-mid)" }}
                        >
                          {ins.name}
                        </div>
                        <VerifiedIcon verified={entry?.verified} />
                      </div>
                      <div
                        className="text-[13px] font-semibold leading-snug"
                        style={{ color: "var(--gmc-ink-2)" }}
                      >
                        {entry?.short ? (
                          <GlossaryText text={entry.short} glossary={glossary} />
                        ) : (
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

              {f.why && (
                <p
                  className="mt-4 text-[12.5px] leading-relaxed italic"
                  style={{ color: "var(--gmc-muted)" }}
                  data-testid={`glance-why-${f.feature.replace(/\s+/g, "-").toLowerCase()}`}
                >
                  <GlossaryText text={f.why} glossary={glossary} />
                </p>
              )}

              <div
                className="mt-4 text-[11px] font-bold uppercase tracking-[0.1em]"
                style={{ color: "var(--gmc-teal-mid)" }}
              >
                Read the full detail →
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
