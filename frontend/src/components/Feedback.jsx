import { useState } from "react";
import { MessageCircleQuestion, Check } from "lucide-react";
import CTA from "@/components/CTA";

const STORAGE_KEY = "gmc_feedback_questions";

export default function Feedback() {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        q,
        at: new Date().toISOString(),
        path: typeof window !== "undefined" ? window.location.pathname : "",
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (err) {
      // storage full / disabled — silently proceed; the CTA still works
    }
    setSubmitted(true);
  };

  return (
    <section
      className="pb-12 sm:pb-16"
      data-testid="feedback-section"
    >
      <div className="gmc-container">
        <div
          className="gmc-card p-6 sm:p-8 flex flex-col gap-4"
          data-testid="feedback-card"
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

          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
              data-testid="feedback-form"
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. Does any of these cover ADHD assessments?"
                className="flex-1 h-11 px-4 rounded-[var(--gmc-r-ctl)] border-[1.5px] bg-white text-[14px] focus:outline-none focus:border-[color:var(--gmc-teal)] focus:ring-2 focus:ring-[color:var(--gmc-teal)]/20 transition"
                style={{
                  borderColor: "var(--gmc-line-soft)",
                  color: "var(--gmc-ink)",
                }}
                data-testid="feedback-input"
                maxLength={500}
                required
              />
              <button
                type="submit"
                className="gmc-btn-secondary h-11"
                data-testid="feedback-submit"
              >
                Ask this
              </button>
            </form>
          ) : (
            <div
              className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between p-4 rounded-[var(--gmc-r-ctl)]"
              style={{ background: "var(--gmc-teal-tint)" }}
              data-testid="feedback-thanks"
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
                    Advisers see cases like yours every day and can point you at
                    the exact wording that answers it.
                  </p>
                </div>
              </div>
              <CTA
                label="Talk to an adviser — free"
                data-testid="feedback-cta"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
