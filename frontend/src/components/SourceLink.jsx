import { FileText, ExternalLink } from "lucide-react";
import InfoReveal from "@/components/InfoReveal";

/**
 * Compact provenance affordance.
 *
 * Version strings ("Policy document, effective 1 Apr 2026") are long, repeat on
 * every card and column, and matter to almost nobody on first read, but they
 * have to stay one tap away because "every value is cited" is the premise of the
 * tool. So the citation collapses to the word "Source" and opens the document
 * name, its effective date and a link to the PDF.
 */
export default function SourceLink({ insurer, citation, className = "", align = "start" }) {
  const sources = Array.isArray(insurer.sources) ? insurer.sources : [];

  return (
    <InfoReveal
      eyebrow="Where this comes from"
      title={`${insurer.name}, ${insurer.product}`}
      align={align}
      side="bottom"
      width="w-72"
      ariaLabel={`Source for ${insurer.name}`}
      testId={`source-link-${insurer.id}`}
      triggerClassName={`gmc-tap inline-flex items-center gap-1 gmc-t-sm sm:gmc-t-xs gmc-w-strong underline decoration-dotted underline-offset-2 hover:decoration-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gmc-teal)] rounded-[var(--gmc-r-ctl)] ${className}`}
      triggerStyle={{ color: "var(--gmc-muted)" }}
      body={
        <>
          <p className="leading-relaxed">{insurer.version}</p>
          {citation && (
            <p
              className="gmc-t-sm sm:gmc-t-xs leading-relaxed mt-2 pt-2"
              style={{ color: "var(--gmc-muted)", borderTop: "1px solid var(--gmc-line)" }}
            >
              Cited passage: {citation}
            </p>
          )}
          {sources.length > 0 && (
            <ul className="mt-2.5 space-y-1.5">
              {sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-1.5 gmc-t-base sm:gmc-t-sm underline decoration-dotted underline-offset-2 hover:decoration-solid"
                    style={{ color: "var(--gmc-teal-deep)" }}
                  >
                    {s.label}
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" strokeWidth={2} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </>
      }
    >
      <FileText className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={2.2} aria-hidden="true" />
      Source
    </InfoReveal>
  );
}
