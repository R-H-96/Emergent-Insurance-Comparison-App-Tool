import { Check } from "lucide-react";

export default function InsurerPicker({ insurers, selected, onToggle }) {
  return (
    <div data-testid="insurer-picker">
      <div className="flex items-baseline justify-between gap-4 flex-wrap mb-4">
        <div>
          <div className="gmc-eyebrow mb-2">Choose insurers</div>
          <h2 className="gmc-h2 text-2xl sm:text-3xl">
            Pick 2 or 3 to compare
          </h2>
        </div>
        <div
          className="text-xs font-semibold"
          style={{ color: "var(--gmc-muted)" }}
          data-testid="insurer-count"
        >
          {selected.length} of 3 selected
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {insurers.map((ins) => {
          const isSelected = selected.includes(ins.id);
          const disabled = !isSelected && selected.length >= 3;
          return (
            <button
              key={ins.id}
              type="button"
              onClick={() => onToggle(ins.id)}
              aria-pressed={isSelected}
              disabled={disabled}
              className={`text-left p-4 rounded-[var(--gmc-r-ctl)] border-[1.5px] transition-all ${
                isSelected
                  ? "border-[color:var(--gmc-teal)] bg-[color:var(--gmc-teal-tint)]"
                  : "border-[color:var(--gmc-line-soft)] bg-white hover:border-[color:var(--gmc-teal)] hover:bg-[color:var(--gmc-teal-tint)]"
              } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              data-testid={`insurer-${ins.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className="font-extrabold text-[15px] leading-tight"
                  style={{ color: "var(--gmc-ink)" }}
                >
                  {ins.name}
                </div>
                {isSelected && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--gmc-teal)" }}
                  >
                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </div>
              <div
                className="mt-1 text-xs font-semibold"
                style={{ color: "var(--gmc-teal-mid)" }}
              >
                {ins.product}
              </div>
              <div
                className="mt-2 text-[11px] leading-relaxed"
                style={{ color: "var(--gmc-muted)" }}
              >
                {ins.version}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
