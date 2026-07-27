import { useMemo, useState } from "react";
import { BookOpen, Search, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import MobileSheet from "@/components/MobileSheet";
import useMediaQuery from "@/hooks/useMediaQuery";

/**
 * Every insurance word in one place.
 *
 * Terms wrapped in {braces} already explain themselves where they appear, but
 * that only covers text we've marked up — the insurers' own values are full of
 * jargon we deliberately haven't edited. This is the fallback: a reader who
 * hits an unfamiliar word anywhere can look it up without leaving the page.
 */
export default function GlossaryPanel({ glossary, open, onOpenChange }) {
  const isMobile = !useMediaQuery("(min-width: 768px)");
  const [q, setQ] = useState("");

  const terms = useMemo(() => {
    const all = Object.entries(glossary || {}).sort((a, b) =>
      a[0].toLowerCase().localeCompare(b[0].toLowerCase()),
    );
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter(
      ([k, v]) => k.toLowerCase().includes(needle) || v.toLowerCase().includes(needle),
    );
  }, [glossary, q]);

  const Body = (
    <div className="p-5 sm:p-6">
      <div
        className="flex items-center gap-2 min-h-[44px] px-3 rounded-[var(--gmc-r-ctl)] border-2 bg-white mb-4"
        style={{ borderColor: "var(--gmc-line)" }}
      >
        <Search className="w-4 h-4 flex-shrink-0" strokeWidth={2} style={{ color: "var(--gmc-teal-mid)" }} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a word — try 'excess'"
          className="flex-1 bg-transparent text-[15px] focus:outline-none py-2"
          style={{ color: "var(--gmc-ink)" }}
          aria-label="Search the glossary"
          data-testid="glossary-search"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="gmc-tap flex-shrink-0"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" style={{ color: "var(--gmc-muted)" }} />
          </button>
        )}
      </div>

      {terms.length === 0 ? (
        <p className="text-[13.5px] py-4 text-center" style={{ color: "var(--gmc-body)" }}>
          Nothing matches &ldquo;{q}&rdquo;. Try a shorter word, or ask an adviser — some terms
          only appear in an insurer&apos;s own wording.
        </p>
      ) : (
        <dl className="space-y-3.5">
          {terms.map(([term, def]) => (
            <div
              key={term}
              className="pb-3.5"
              style={{ borderBottom: "1px solid var(--gmc-line)" }}
              data-testid={`glossary-entry-${term.replace(/\s+/g, "-").toLowerCase()}`}
            >
              <dt className="font-extrabold text-[14.5px]" style={{ color: "var(--gmc-ink)" }}>
                {term}
              </dt>
              <dd className="text-[13.5px] leading-relaxed mt-0.5" style={{ color: "var(--gmc-body)" }}>
                {def}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <p className="text-[11.5px] leading-relaxed mt-4" style={{ color: "var(--gmc-faint)" }}>
        Plain-English explanations written by Get My Cover, not definitions from any insurer&apos;s
        policy. Where a policy defines a term differently, the policy wording is what counts.
      </p>
    </div>
  );

  if (isMobile) {
    return (
      <MobileSheet
        open={open}
        onClose={() => onOpenChange(false)}
        eyebrow="Plain English"
        title="What the words mean"
        titleIcon={<BookOpen className="w-5 h-5" strokeWidth={2.2} />}
        testId="glossary-sheet"
        scrollKey="glossary"
      >
        {Body}
      </MobileSheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl max-h-[85vh] overflow-y-auto bg-white rounded-[var(--gmc-r-card)] border-[color:var(--gmc-line)] p-0 gap-0"
        data-testid="glossary-dialog"
      >
        <DialogHeader className="p-6 pb-3 border-b" style={{ borderColor: "var(--gmc-line)" }}>
          <DialogTitle
            className="text-2xl font-extrabold tracking-tight text-left flex items-center gap-2.5"
            style={{ color: "var(--gmc-ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <BookOpen className="w-5 h-5" strokeWidth={2.2} style={{ color: "var(--gmc-teal)" }} />
            What the words mean
          </DialogTitle>
          <DialogDescription className="text-sm mt-1 text-left" style={{ color: "var(--gmc-body)" }}>
            Every insurance term used in this tool, in plain English.
          </DialogDescription>
        </DialogHeader>
        {Body}
      </DialogContent>
    </Dialog>
  );
}
