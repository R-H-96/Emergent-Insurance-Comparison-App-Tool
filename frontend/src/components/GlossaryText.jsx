import { Fragment, useMemo } from "react";
import InfoReveal from "@/components/InfoReveal";

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
  // No definition: still underline it so authors notice the gap.
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
    <InfoReveal
      eyebrow="Glossary"
      title={term}
      body={definition}
      ariaLabel={`Glossary: ${term}`}
      testId={`glossary-term-${term.replace(/\s+/g, "-").toLowerCase()}`}
      triggerClassName="underline decoration-dotted decoration-1 underline-offset-2 hover:decoration-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gmc-teal)] rounded-sm px-0.5 -mx-0.5 cursor-help"
      triggerStyle={{ color: "var(--gmc-teal-deep)" }}
    >
      {term}
    </InfoReveal>
  );
}
