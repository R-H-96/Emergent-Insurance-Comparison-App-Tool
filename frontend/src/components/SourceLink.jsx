import { FileText, ExternalLink } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Compact provenance affordance.
 *
 * Version strings ("Policy document, effective 1 Apr 2026") are long, repeat on
* every card and column, and matter to almost nobody on first read but they
 * have to remain one click away, because "every value is cited" is the whole
 * premise of the tool. So the citation collapses to the word "Source" and opens
 * the document name, its effective date and a link to the PDF.
 */
export default function SourceLink({ insurer, citation, className = "", align = "start" }) {
  const sources = Array.isArray(insurer.sources) ? insurer.sources : [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className={`gmc-tap inline-flex items-center gap-1 text-[12px] sm:text-[11px] font-semibold underline decoration-dotted underline-offset-2 hover:decoration-solid focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gmc-teal)] rounded-sm ${className}`}
          style={{ color: "var(--gmc-muted)" }}
          aria-label={`Source for ${insurer.name}`}
          data-testid={`source-link-${insurer.id}`}
        >
          <FileText className="w-3 h-3 flex-shrink-0" strokeWidth={2.2} aria-hidden="true" />
          Source
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 bg-white border rounded-[16px] p-4 shadow-[0_12px_40px_rgba(22,28,39,0.12)]"
        style={{ borderColor: "var(--gmc-line)" }}
        side="bottom"
        align={align}
        onClick={(e) => e.stopPropagation()}
        data-testid="source-popover"
      >
        <div
          className="text-[12px] sm:text-[11px] font-bold uppercase tracking-[0.1em] mb-1"
          style={{ color: "var(--gmc-teal-mid)" }}
        >
          Where this comes from
        </div>
        <div className="font-extrabold text-[15px] sm:text-[14px]" style={{ color: "var(--gmc-ink)" }}>
{insurer.name}, {insurer.product}
        </div>
        <p className="text-[13.5px] sm:text-[12.5px] leading-relaxed mt-1" style={{ color: "var(--gmc-body)" }}>
          {insurer.version}
        </p>
        {citation && (
          <p
            className="text-[12.5px] sm:text-[11.5px] leading-relaxed mt-2 pt-2"
            style={{ color: "var(--gmc-muted)", borderTop: "1px solid var(--gmc-line)" }}
          >
            Cited passage: {citation}
          </p>
        )}
        {sources.length > 0 && (
          <ul className="mt-2.5 space-y-1">
            {sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-start gap-1.5 text-[13px] sm:text-[12px] underline decoration-dotted underline-offset-2 hover:decoration-solid"
                  style={{ color: "var(--gmc-teal-deep)" }}
                >
                  {s.label}
                  <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" strokeWidth={2} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
