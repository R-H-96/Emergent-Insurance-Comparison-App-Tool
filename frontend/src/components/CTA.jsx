export default function CTA({ compact = false, "data-testid": testId, ...rest }) {
  // Class-only trigger — the parent site's global modal binds to `.gmc-quote-trigger`.
  // Do NOT add onClick here (compliance rule 4).
  return (
    <button
      type="button"
      className={`gmc-btn-primary gmc-quote-trigger ${compact ? "py-2 px-4 text-xs" : ""}`}
      data-testid={testId || "gmc-quote-cta"}
      {...rest}
    >
      {compact
        ? "Talk to an adviser"
        : "Talk it through with an FMA-licensed adviser — free"}
    </button>
  );
}
