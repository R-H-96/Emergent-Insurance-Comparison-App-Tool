import { useState } from "react";
import { MessageCircleQuestion, Check, ArrowRight, Search } from "lucide-react";
import CTA from "@/components/CTA";
import InsurerLogo from "@/components/InsurerLogo";
import { matchQuestion } from "@/lib/askEngine";

const STORAGE_KEY = "gmc_feedback_questions";
const DEFERRED_SHIMMER_MS = 800;

/**
 * "Ask a question" panel. On submit:
 *  1. Persist question to localStorage
 *  2. Show a shimmer for ~800ms
 *  3. Deterministic client-side keyword-match against features/definitions/glossary
 *  4. If matched: render a result card with per-insurer short values and a
 *     "Show me in the table" button (scrolls + flash-highlights the row and
 *     can open the detail modal). If no match: show the adviser fallback.
 */
export default function AskAQuestion({
  features,
  data,
  glossary,
  insurers,
  lookup,
  onLocate, // (featureName) => void — scroll+flash the table row
  onOpenFeature, // (featureName) => void — open the detail modal
}) {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState("idle"); // idle | searching | match | nomatch
  const [result, setResult] = useState(null);

  const persist = (q) => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        q,
        at: new Date().toISOString(),
        path: typeof window !== "undefined" ? window.location.pathname : "",
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_err) {
      // storage full / disabled — ignore
    }
  };

  const reset = () => {
    setStatus("idle");
    setResult(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    persist(q);
    setStatus("searching");
    setResult(null);
    setTimeout(() => {
      const match = matchQuestion(q, { features, data, glossary });
      if (match) {
        setResult(match);
        setStatus("match");
      } else {
        setStatus("nomatch");
      }
    }, DEFERRED_SHIMMER_MS);
  };

  return (
    <section
      className="pb-12 sm:pb-16"
      id="ask-a-question"
      data-testid="ask-section"
    >
      <div className="gmc-container">
        <div
          className="gmc-card p-6 sm:p-8 flex flex-col gap-4"
          data-testid="ask-card"
        >
          <div className="flex items-center gap-2">
            <MessageCircleQuestion
              className="w-5 h-5"
              strokeWidth={2}
              style={{ color: "var(--gmc-teal-mid)" }}
            />
            <h3 className="gmc-h3 text-lg sm:text-xl">
              Can&apos;t find what you&apos;re looking for?
            </h3>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3"
            data-testid="ask-form"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (status !== "idle") reset();
              }}
              placeholder="e.g. Does any of these cover ADHD assessments?"
              className="flex-1 h-11 gmc-tap px-4 rounded-[var(--gmc-r-ctl)] border-[1.5px] bg-white text-[14px] focus:outline-none focus:border-[color:var(--gmc-teal)] focus:ring-2 focus:ring-[color:var(--gmc-teal)]/20 transition"
              style={{
                borderColor: "var(--gmc-line-soft)",
                color: "var(--gmc-ink)",
              }}
              data-testid="ask-input"
              maxLength={500}
              required
              disabled={status === "searching"}
            />
            <button
              type="submit"
              className="gmc-btn-secondary h-11 gmc-tap"
              data-testid="ask-submit"
              disabled={status === "searching"}
            >
              <Search className="w-4 h-4" strokeWidth={2.2} />
              Search policies
            </button>
          </form>

          {status === "searching" && (
            <div
              className="mt-1 gmc-shimmer rounded-[var(--gmc-r-ctl)] h-20 flex items-center px-4 text-[13px] font-semibold"
              style={{ color: "var(--gmc-teal-deep)" }}
              data-testid="ask-searching"
              aria-live="polite"
            >
              Searching the policy data…
            </div>
          )}

          {status === "match" && result && (
            <MatchResult
              result={result}
              insurers={insurers}
              lookup={lookup}
              onLocate={onLocate}
              onOpenFeature={onOpenFeature}
              onAskAnother={reset}
            />
          )}

          {status === "nomatch" && (
            <NoMatch onAskAnother={reset} />
          )}
        </div>
      </div>
    </section>
  );
}

function MatchResult({ result, insurers, lookup, onLocate, onOpenFeature, onAskAnother }) {
  const { feature } = result;
  return (
    <div
      className="rounded-[var(--gmc-r-ctl)] border p-4 sm:p-5 gmc-fade-in"
      style={{
        borderColor: "var(--gmc-teal)",
        background: "var(--gmc-teal-tint)",
      }}
      data-testid="ask-match"
    >
      <div
        className="text-[11px] font-bold uppercase tracking-[0.1em]"
        style={{ color: "var(--gmc-teal-deep)" }}
      >
        Best match · {feature.group}
      </div>
      <div
        className="mt-1 font-extrabold text-[16px] sm:text-[18px]"
        style={{ color: "var(--gmc-ink)" }}
      >
        Here&apos;s what the policies say about {feature.feature}
      </div>
      <p
        className="text-[13px] mt-1 leading-relaxed"
        style={{ color: "var(--gmc-body)" }}
      >
        {feature.definition}
      </p>

      <div
        className="mt-4 grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${insurers.length}, minmax(0, 1fr))`,
        }}
      >
        {insurers.map((ins) => {
          const entry = lookup[ins.id]?.[feature.feature];
          return (
            <div
              key={ins.id}
              className="rounded-[10px] p-3 bg-white border"
              style={{
                borderColor: "var(--gmc-line)",
                borderLeftWidth: 3,
                borderLeftColor: ins.accent || "var(--gmc-teal)",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <InsurerLogo insurer={ins} size={22} />
                <div
                  className="text-[11px] font-bold uppercase tracking-[0.05em]"
                  style={{ color: ins.accent || "var(--gmc-teal-mid)" }}
                >
                  {ins.name}
                </div>
              </div>
              <div
                className="text-[13px] font-semibold leading-snug"
                style={{ color: "var(--gmc-ink-2)" }}
              >
                {entry?.short || (
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

      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          className="gmc-btn-primary gmc-tap"
          onClick={() => onLocate(feature.feature)}
          data-testid="ask-locate-btn"
        >
          Show me in the table
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          className="gmc-btn-outline gmc-tap"
          onClick={() => onOpenFeature(feature.feature)}
          data-testid="ask-open-modal-btn"
        >
          Read the full detail
        </button>
        <button
          type="button"
          className="gmc-btn-secondary gmc-tap"
          onClick={onAskAnother}
          data-testid="ask-another-btn"
        >
          Ask another
        </button>
      </div>
    </div>
  );
}

function NoMatch({ onAskAnother }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between p-4 rounded-[var(--gmc-r-ctl)] gmc-fade-in"
      style={{ background: "var(--gmc-teal-tint)" }}
      data-testid="ask-nomatch"
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
            className="font-extrabold text-[15px]"
            style={{ color: "var(--gmc-ink)" }}
          >
            Good question — that&apos;s one for an adviser.
          </div>
          <p
            className="text-[13px] mt-0.5"
            style={{ color: "var(--gmc-body)" }}
          >
            Advisers see cases like yours every day and can point you at the
            exact wording that answers it.
          </p>
          <button
            type="button"
            className="mt-2 text-[12px] font-bold uppercase tracking-[0.08em] underline underline-offset-2"
            style={{ color: "var(--gmc-teal-deep)" }}
            onClick={onAskAnother}
            data-testid="ask-another-nomatch"
          >
            Ask another question
          </button>
        </div>
      </div>
      <CTA
        label="Talk to an adviser — free"
        data-testid="ask-adviser-cta"
      />
    </div>
  );
}
