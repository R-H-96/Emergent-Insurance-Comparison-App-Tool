export default function CTA({
  compact = false,
  label,"data-testid": testId,
  ...rest
}) {
// Class-only trigger. The parent site's global modal binds to `.gmc-quote-trigger`.
  // Do NOT add onClick here (compliance rule 4).
  const text =
    label ??
    (compact
      ? "Talk to an adviser"
: "Talk it through with an FMA-licensed adviser, free");
  return (
    <button
      type="button"
      className={`gmc-btn-primary gmc-quote-trigger ${compact ? "py-2 px-4 text-xs" : ""}`}
      data-testid={testId || "gmc-quote-cta"}
      {...rest}
    >
      {text}
    </button>
  );
}
