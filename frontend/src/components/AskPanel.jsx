import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X, Search, ArrowRight, Check, MessageCircleQuestion } from "lucide-react";
import MobileSheet from "@/components/MobileSheet";
import useMediaQuery from "@/hooks/useMediaQuery";
import useRotatingPlaceholder from "@/hooks/useRotatingPlaceholder";
import InsurerLogo from "@/components/InsurerLogo";
import GlossaryText from "@/components/GlossaryText";
import CTA from "@/components/CTA";

/**
* Floating ask panel, desktop drawer (~420px) anchored bottom-right.
 * On mobile the content is surfaced via MobileFAB's Ask tab instead;
 * this component renders nothing below xl.
 */
export default function AskPanel({
  open,
  onClose,
  askState,
  examples,
  insurers,
  lookup,
  glossary,
  onLocate,
  onOpenFeature,
}) {
  const isDesktop = useMediaQuery("(min-width: 1200px)");
  const reduce = useReducedMotion();

  if (!isDesktop) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="ask-panel"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: reduce ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed right-24 bottom-6 z-[9980] w-[420px] max-w-[420px] max-h-[70vh] flex flex-col rounded-[var(--gmc-r-card)] overflow-hidden"
          style={{
            background: "white",
            border: "1px solid var(--gmc-line)",
            boxShadow: "var(--gmc-shadow-float)",
          }}
          data-testid="ask-panel-desktop"
        >
          <div
            className="flex items-center justify-between gap-2 px-4 py-3 border-b flex-shrink-0"
            style={{ borderColor: "var(--gmc-line)" }}
          >
            <div className="flex items-center gap-2">
              <MessageCircleQuestion
                className="w-4 h-4"
                strokeWidth={2.2}
                style={{ color: "var(--gmc-teal-mid)" }}
              />
              <div className="gmc-w-heavy gmc-t-md" style={{ color: "var(--gmc-ink)" }}>
                Ask a question
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="gmc-tap w-9 h-9 rounded-full flex items-center justify-center hover:bg-[color:var(--gmc-bg-alt)]"
              data-testid="ask-panel-close"
              aria-label="Close ask panel"
            >
              <X className="w-4 h-4" style={{ color: "var(--gmc-body)" }} />
            </button>
          </div>
          <AskPanelBody
            askState={askState}
            examples={examples}
            insurers={insurers}
            lookup={lookup}
            glossary={glossary}
            onLocate={onLocate}
            onOpenFeature={onOpenFeature}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Named export so MobileFAB can embed the body directly in its Ask tab
export function AskPanelBody({ askState, examples, insurers, lookup, glossary, onLocate, onOpenFeature }) {
  const { question, setQuestion, status, result, history, submit, reset } = askState;
  const [focused, setFocused] = useState(false);
  const placeholder = useRotatingPlaceholder(examples, { focused });

  const handleSubmit = (e) => {
    e.preventDefault();
    submit();
  };

  return (
    <div className="flex flex-col h-full">
      <form
        onSubmit={handleSubmit}
        className="p-4 border-b bg-white sticky top-0 z-[1]"
        style={{ borderColor: "var(--gmc-line)" }}
        data-testid="ask-panel-form"
      >
        <div
          className="flex items-center gap-2 min-h-[48px] px-3 rounded-[var(--gmc-r-ctl)] border-2 bg-white"
          style={{
            borderColor: focused ? "var(--gmc-teal)" : "var(--gmc-line)",
            boxShadow: focused ? "var(--gmc-focus-ring)" : "none",
          }}
        >
          <Search
            className="w-4 h-4 flex-shrink-0"
            strokeWidth={2}
            style={{ color: "var(--gmc-teal-mid)" }}
          />
          <input
            type="text"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);
              if (status !== "idle" && status !== "match" && status !== "nomatch") reset();
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent gmc-t-md focus:outline-none"
            style={{ color: "var(--gmc-ink)" }}
            maxLength={500}
            aria-label="Ask a question about these policies"
            data-testid="ask-panel-input"
            disabled={status === "searching"}
          />
          <button
            type="submit"
            className="gmc-btn-primary gmc-tap px-3 py-2 min-h-[40px]"
            data-testid="ask-panel-submit"
            disabled={!question.trim() || status === "searching"}
          >
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </form>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 thin-scrollbar" data-testid="ask-panel-body">
        {status === "searching" && (
          <div
            className="gmc-shimmer rounded-[var(--gmc-r-ctl)] h-14 flex items-center px-4 gmc-t-sm gmc-w-strong"
            style={{ color: "var(--gmc-teal-deep)" }}
            aria-live="polite"
          >
            Searching the policy data…
          </div>
        )}

        {status === "match" && result && (
          <ResultCard
            feature={result.feature}
            insurers={insurers}
            lookup={lookup}
            glossary={glossary}
            onLocate={onLocate}
            onOpenFeature={onOpenFeature}
          />
        )}

        {status === "nomatch" && (
          <div
            className="gmc-inset-note p-3"
            data-testid="ask-panel-nomatch"
          >
            <div className="flex items-start gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "var(--gmc-teal)" }}
              >
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </div>
              <div>
                <div
                  className="gmc-w-heavy gmc-t-base"
                  style={{ color: "var(--gmc-ink)" }}
                >
Good question, that&apos;s one for an adviser.
                </div>
                <div className="mt-2">
<CTA compact label="Ask an adviser, free" data-testid="ask-panel-adviser-cta" />
                </div>
              </div>
            </div>
          </div>
        )}

        {history.length > 1 && (
          <div
            className="gmc-t-xs gmc-w-strong uppercase tracking-[0.1em] pt-2 pb-1"
            style={{ color: "var(--gmc-muted)" }}
          >
            Earlier this session
          </div>
        )}
        {history.slice(1).map((h, i) => (
          <div
            key={h.at + "_" + i}
            className="gmc-inset p-3"
            data-testid={`ask-panel-history-${i}`}
          >
            <div
              className="gmc-t-xs gmc-w-strong uppercase tracking-[0.08em]"
              style={{ color: "var(--gmc-muted)" }}
            >
              You asked
            </div>
            <div
              className="gmc-t-sm gmc-w-strong mt-0.5"
              style={{ color: "var(--gmc-ink)" }}
            >
              &ldquo;{h.q}&rdquo;
            </div>
            {h.feature ? (
              <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
                <div className="gmc-t-sm" style={{ color: "var(--gmc-body)" }}>
                  Matched to <b>{h.feature.feature}</b>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    className="gmc-btn-outline gmc-tap px-2 py-1 gmc-t-xs"
                    onClick={() => onLocate(h.feature.feature)}
                  >
                    Show me
                  </button>
                  <button
                    type="button"
                    className="gmc-btn-outline gmc-tap px-2 py-1 gmc-t-xs"
                    onClick={() => onOpenFeature(h.feature.feature)}
                  >
                    Full detail
                  </button>
                </div>
              </div>
            ) : (
              <div className="gmc-t-sm mt-1" style={{ color: "var(--gmc-body)" }}>
No direct match. Logged for an adviser to review.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ feature, insurers, lookup, glossary, onLocate, onOpenFeature }) {
  return (
    <div
      className="rounded-[var(--gmc-r-ctl)] p-3 border gmc-fade-in"
      style={{ borderColor: "var(--gmc-teal)", background: "var(--gmc-teal-tint)" }}
      data-testid="ask-panel-match"
    >
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span
          className="gmc-t-xs gmc-w-strong uppercase tracking-[0.1em]"
          style={{ color: "var(--gmc-teal-deep)" }}
        >
          Best match
        </span>
        <span
          className="gmc-badge-verified"
          style={{ background: "var(--gmc-teal-tint-2)", color: "var(--gmc-teal-deep)" }}
        >
          {feature.group}
        </span>
      </div>
      <div className="gmc-w-heavy gmc-t-md" style={{ color: "var(--gmc-ink)" }}>
        {feature.feature}
      </div>
      <GlossaryText
        tag="p"
        text={feature.definition}
        glossary={glossary}
        className="gmc-t-sm mt-1 leading-relaxed"
      />
      <div className="mt-2.5 space-y-1.5">
        {insurers.map((ins) => {
          const entry = lookup[ins.id]?.[feature.feature];
          return (
            <div
              key={ins.id}
              className="flex items-start gap-2 rounded-[var(--gmc-r-ctl)] p-2 bg-white"
              style={{ border: "1px solid var(--gmc-line)" }}
            >
              <InsurerLogo insurer={ins} size={20} />
              <div className="flex-1 min-w-0">
                <div
                  className="gmc-t-xs gmc-w-strong uppercase tracking-[0.05em]"
                  style={{ color: ins.accent || "var(--gmc-teal-mid)" }}
                >
                  {ins.name}
                </div>
                <div className="gmc-t-sm gmc-w-strong" style={{ color: "var(--gmc-ink-2)" }}>
                  {entry?.short ? (
                    <GlossaryText text={entry.short} glossary={glossary} />
                  ) : (
<span style={{ color: "var(--gmc-muted)" }}>Not recorded</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="gmc-btn-primary gmc-tap flex-1"
          onClick={() => onLocate(feature.feature)}
          data-testid="ask-panel-locate"
        >
          Show me
        </button>
        <button
          type="button"
          className="gmc-btn-outline gmc-tap flex-1"
          onClick={() => onOpenFeature(feature.feature)}
          data-testid="ask-panel-open"
        >
          Full detail
        </button>
      </div>
    </div>
  );
}
