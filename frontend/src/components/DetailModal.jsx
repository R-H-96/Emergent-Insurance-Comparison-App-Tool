import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import MobileSheet from "@/components/MobileSheet";
import useMediaQuery from "@/hooks/useMediaQuery";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import GlossaryText from "@/components/GlossaryText";
import InsurerMark from "@/components/InsurerMark";
import FeatureIcon from "@/components/FeatureIcon";
import CTA from "@/components/CTA";

export default function DetailModal({ feature, insurers, lookup, glossary, onClose }) {
  const isMobile = !useMediaQuery("(min-width: 768px)");
  if (!feature) return null;

  const Body = (
    <div className="p-5 sm:p-8 space-y-4">
      {insurers.map((ins) => {
        const entry = lookup[ins.id]?.[feature.feature];
        const points = entry?.detail_points && entry.detail_points.length > 0
          ? entry.detail_points
          : entry?.detail
            ? [entry.detail]
            : [];
        const sources = Array.isArray(ins.sources) ? ins.sources : [];
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
                <InsurerMark insurer={ins} size={32} />
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
                  className="mt-3 rounded-[10px] px-3 py-2.5 inline-block text-[14px] font-semibold"
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
                  className="mt-4 pt-3 border-t"
                  style={{ borderColor: "var(--gmc-line)" }}
                >
                  <div
                    className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1.5"
                    style={{ color: "var(--gmc-body)" }}
                  >
                    Sources
                  </div>
                  {sources.length > 0 ? (
                    <ul className="space-y-1" data-testid={`sources-${ins.id}`}>
                      {sources.map((s, i) => (
                        <li key={i}>
                          <a
                            href={s.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[12px] underline decoration-dotted underline-offset-2 hover:decoration-solid"
                            style={{ color: "var(--gmc-teal-deep)" }}
                            data-testid={`source-link-${ins.id}-${i}`}
                          >
                            {s.label}
                            <ExternalLink className="w-3 h-3" strokeWidth={2} />
                          </a>
                        </li>
                      ))}
                      {entry.source && (
                        <li
                          className="text-[11px] mt-1"
                          style={{ color: "var(--gmc-muted)" }}
                        >
                          Cited passage: {entry.source}
                        </li>
                      )}
                    </ul>
                  ) : (
                    <div
                      className="text-[12px]"
                      style={{ color: "var(--gmc-muted)" }}
                    >
                      {entry.source}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="mt-4 text-[18px] font-light" style={{ color: "var(--gmc-faint)" }}>
                —
              </p>
            )}
          </div>
        );
      })}
    </div>
  );

  const Footer = (
    <div
      className="p-5 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      style={{ background: "var(--gmc-bg-alt)" }}
    >
      <p
        className="text-[13px] leading-relaxed max-w-md"
        style={{ color: "var(--gmc-body)" }}
      >
        Not sure how this applies to you? Ask an adviser — free.
      </p>
      <CTA label="Ask an adviser — free" data-testid="detail-modal-cta" />
    </div>
  );

  if (isMobile) {
    return (
      <MobileSheet
        open={true}
        onClose={onClose}
        eyebrow={feature.group}
        title={feature.feature}
        titleIcon={<FeatureIcon name={feature.feature} size={20} />}
        testId="detail-sheet"
        footer={Footer}
      >
        <div
          className="px-5 pt-4 pb-2 text-[13px]"
          style={{ color: "var(--gmc-body)" }}
        >
          <GlossaryText tag="span" text={feature.definition} glossary={glossary} />
        </div>
        {Body}
      </MobileSheet>
    );
  }

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
            className="text-2xl font-extrabold tracking-tight text-left flex items-center gap-2.5"
            style={{
              color: "var(--gmc-ink)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <FeatureIcon name={feature.feature} size={22} strokeWidth={2.2} />
            <span>{feature.feature}</span>
          </DialogTitle>
          <DialogDescription className="text-sm mt-2 text-left" style={{ color: "var(--gmc-body)" }}>
            <GlossaryText
              tag="span"
              text={feature.definition}
              glossary={glossary}
            />
          </DialogDescription>
        </DialogHeader>

        {Body}

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
