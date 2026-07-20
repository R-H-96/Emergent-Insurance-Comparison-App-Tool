import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import GlossaryText from "@/components/GlossaryText";
import InsurerLogo from "@/components/InsurerLogo";
import CTA from "@/components/CTA";

export default function DetailModal({ feature, insurers, lookup, glossary, onClose }) {
  if (!feature) return null;

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-[var(--gmc-r-card)] border-[color:var(--gmc-line)] p-0 gap-0"
        data-testid="detail-modal"
      >
        <DialogHeader className="p-6 sm:p-8 pb-4 border-b" style={{ borderColor: "var(--gmc-line)" }}>
          <div
            className="text-[11px] font-bold uppercase tracking-[0.1em] mb-2"
            style={{ color: "var(--gmc-teal-mid)" }}
          >
            {feature.group}
          </div>
          <DialogTitle
            className="text-2xl font-extrabold tracking-tight text-left"
            style={{
              color: "var(--gmc-ink)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {feature.feature}
          </DialogTitle>
          <DialogDescription asChild>
            <GlossaryText
              tag="p"
              text={feature.definition}
              glossary={glossary}
              className="text-sm mt-2 text-left"
            />
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 sm:p-8 space-y-4">
          {insurers.map((ins) => {
            const entry = lookup[ins.id]?.[feature.feature];
            const points = entry?.detail_points && entry.detail_points.length > 0
              ? entry.detail_points
              : entry?.detail
                ? [entry.detail]
                : [];
            return (
              <div
                key={ins.id}
                className="rounded-[16px] border p-5"
                style={{
                  borderColor: "var(--gmc-line)",
                  background: "var(--gmc-card)",
                  borderLeftWidth: 4,
                  borderLeftColor: ins.accent || "var(--gmc-teal)",
                }}
                data-testid={`detail-block-${ins.id}`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <InsurerLogo insurer={ins} size={32} />
                    <div>
                      <div
                        className="font-extrabold text-[16px]"
                        style={{ color: ins.accent || "var(--gmc-ink)" }}
                      >
                        {ins.name}
                      </div>
                      <div
                        className="text-[12px] font-semibold mt-0.5"
                        style={{ color: "var(--gmc-muted)" }}
                      >
                        {ins.product}
                      </div>
                    </div>
                  </div>
                  <VerifiedBadge verified={entry?.verified} />
                </div>

                {entry ? (
                  <>
                    <div
                      className="mt-3 rounded-[10px] px-3 py-2 inline-block text-[13px] font-semibold"
                      style={{
                        background: "var(--gmc-teal-tint)",
                        color: "var(--gmc-teal-deep)",
                      }}
                    >
                      <GlossaryText text={entry.short} glossary={glossary} />
                    </div>

                    {points.length > 0 && (
                      <ul
                        className="mt-3 space-y-1.5 list-disc pl-5"
                        data-testid={`detail-points-${ins.id}`}
                      >
                        {points.map((p, i) => (
                          <li
                            key={i}
                            className="text-[14px] leading-relaxed"
                            style={{ color: "var(--gmc-ink-2)" }}
                          >
                            <GlossaryText text={p} glossary={glossary} />
                          </li>
                        ))}
                      </ul>
                    )}

                    <div
                      className="mt-3 text-[12px] leading-snug"
                      style={{ color: "var(--gmc-muted)" }}
                    >
                      <span
                        className="font-bold uppercase tracking-[0.08em] mr-1"
                        style={{ color: "var(--gmc-body)" }}
                      >
                        Source
                      </span>
                      <span
                        className="underline decoration-dotted underline-offset-2"
                        style={{ color: "var(--gmc-teal-deep)" }}
                      >
                        {entry.source}
                      </span>
                    </div>
                  </>
                ) : (
                  <p
                    className="mt-3 text-[13px] italic"
                    style={{ color: "var(--gmc-faint)" }}
                  >
                    Not extracted for this policy.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div
          className="p-6 sm:p-8 pt-2 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ borderColor: "var(--gmc-line)", background: "var(--gmc-bg-alt)" }}
        >
          <p
            className="text-[13px] leading-relaxed max-w-md"
            style={{ color: "var(--gmc-body)" }}
          >
            Not sure how this applies to you? Ask an adviser — free.
          </p>
          <CTA
            label="Ask an adviser — free"
            data-testid="detail-modal-cta"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
