import { Fragment, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Renders text with {term} markers replaced by dotted-underline spans that
 * open a small popover with the glossary definition.
 *
* Marker syntax: `{term}`. The term inside is the glossary key AND the
 * visible text. Matching is case-insensitive on the key.
 *
 * Example: "Includes chemo drugs {Pharmac} doesn't fund."
 * If no marker is present, the text renders unchanged.
 */
export default function GlossaryText({ text, glossary, className, tag = "span" }) {
  const parts = useMemo(() => {
    if (!text || typeof text !== "string") return [{ type: "text", value: "" }];
    const out = [];
    const re = /\{([^{}]+)\}/g;
    let last = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push({ type: "text", value: text.slice(last, m.index) });
      out.push({ type: "term", value: m[1] });
      last = m.index + m[0].length;
    }
    if (last < text.length) out.push({ type: "text", value: text.slice(last) });
    return out;
  }, [text]);

  const findDef = (term) => {
    if (!glossary) return null;
    // exact match first
    if (glossary[term]) return glossary[term];
    // case-insensitive fallback
    const lower = term.toLowerCase();
    const key = Object.keys(glossary).find((k) => k.toLowerCase() === lower);
    return key ? glossary[key] : null;
  };

  const Tag = tag;
  return (
    <Tag className={className}>
      {parts.map((p, i) =>
        p.type === "text" ? (
          <Fragment key={i}>{p.value}</Fragment>
        ) : (
          <GlossaryTerm key={i} term={p.value} definition={findDef(p.value)} />
        ),
      )}
    </Tag>
  );
}

function GlossaryTerm({ term, definition }) {
  // If no definition, still show dotted underline so authors notice missing terms.
  if (!definition) {
    return (
      <span
        className="underline decoration-dotted decoration-1 underline-offset-2"
        style={{ color: "var(--gmc-muted)" }}
        title="No glossary entry"
      >
        {term}
      </span>
    );
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") e.stopPropagation();
          }}
          className="underline decoration-dotted decoration-1 underline-offset-2 hover:decoration-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gmc-teal)] rounded-sm px-0.5 -mx-0.5 cursor-help"
          style={{ color: "var(--gmc-teal-deep)" }}
          data-testid={`glossary-term-${term.replace(/\s+/g, "-").toLowerCase()}`}
          aria-label={`Glossary: ${term}`}
        >
          {term}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 bg-white border rounded-[16px] p-4 shadow-[0_12px_40px_rgba(22,28,39,0.12)]"
        style={{ borderColor: "var(--gmc-line)" }}
        side="top"
        align="start"
        data-testid="glossary-popover"
      >
        <div
          className="text-[11px] font-bold uppercase tracking-[0.1em] mb-1"
          style={{ color: "var(--gmc-teal-mid)" }}
        >
          Glossary
        </div>
        <div
          className="font-extrabold text-[14px] mb-1.5"
          style={{ color: "var(--gmc-ink)" }}
        >
          {term}
        </div>
        <p
          className="text-[13px] leading-relaxed"
          style={{ color: "var(--gmc-body)" }}
        >
          {definition}
        </p>
      </PopoverContent>
    </Popover>
  );
}
