import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import useRotatingPlaceholder from "@/hooks/useRotatingPlaceholder";

/**
 * Compact ask bar shown directly under the insurer picker. On submit it uses
 * the shared askState from the parent (so the result appears in the full
 * "Can't find what you're looking for?" section below), then scrolls to
 * that section so the user sees the shimmer + result.
 */
export default function AskCompact({ askState, examples, onResultScroll }) {
  const [focused, setFocused] = useState(false);
  const placeholder = useRotatingPlaceholder(examples, { focused });
  const [local, setLocal] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = local.trim();
    if (!q) return;
    askState.submit(q);
    onResultScroll?.();
    setLocal("");
  };

  return (
    <div className="pb-4 sm:pb-6" data-testid="ask-compact-section">
      <div className="gmc-container">
        <form
          onSubmit={handleSubmit}
          className="gmc-card p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch"
          data-testid="ask-compact-form"
        >
          <div
            className="flex-1 flex items-center gap-2 h-11 gmc-tap px-3 rounded-[var(--gmc-r-ctl)] border-[1.5px] bg-white transition"
            style={{
              borderColor: focused
                ? "var(--gmc-teal)"
                : "var(--gmc-line-soft)",
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
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-[14px] focus:outline-none"
              style={{ color: "var(--gmc-ink)" }}
              maxLength={500}
              aria-label="Ask anything about these policies"
              data-testid="ask-compact-input"
            />
          </div>
          <button
            type="submit"
            className="gmc-btn-primary gmc-tap"
            data-testid="ask-compact-submit"
            disabled={!local.trim() || askState.status === "searching"}
          >
            Ask
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
