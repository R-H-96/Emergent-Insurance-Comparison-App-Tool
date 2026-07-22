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
                className="ml-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--gmc-faint)" }}
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
