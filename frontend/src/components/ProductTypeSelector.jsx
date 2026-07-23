const PRODUCTS = [
  { id: "health", label: "Health insurance", enabled: true },
  { id: "life", label: "Life", enabled: false },
  { id: "trauma", label: "Trauma", enabled: false },
  { id: "income", label: "Income protection", enabled: false },
  { id: "mortgage", label: "Mortgage protection", enabled: false },
];

export default function ProductTypeSelector({ value, onChange }) {
  return (
    <div data-testid="product-type-selector">
      <div className="gmc-eyebrow mb-3">Product type</div>
      <div className="flex flex-wrap gap-2">
        {PRODUCTS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="gmc-chip"
            aria-pressed={value === p.id}
            onClick={() => p.enabled && onChange(p.id)}
            disabled={!p.enabled}
            data-testid={`product-${p.id}`}
          >
            {p.label}
            {!p.enabled && (
              <span
                className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                style={{
                  background: "var(--gmc-bg-soft)",
                  color: "var(--gmc-faint)",
                  border: "1px solid var(--gmc-line)",
                }}
              >
                Soon
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
