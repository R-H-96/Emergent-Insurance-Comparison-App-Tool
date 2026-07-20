/**
 * FilterChips — group filter selector.
 *
 * "All groups" and individual groups are mutually exclusive: clicking any
 * group activates its filter (and implicitly deactivates "All"); clicking
 * "All" clears all group filters.
 *
 * `filled` prop switches to filled brand style (teal accent + white text
 * when active) — used inside popovers / mobile sheet. Default style uses
 * `.gmc-chip` (subtle teal tint) — used inline on the desktop surface.
 */
export default function FilterChips({ groups, activeGroups, onToggle, onClear, filled = false }) {
  const allActive = activeGroups.length === 0;

  const chip = (active, key, label, onClick, testid) => {
    if (filled) {
      return (
        <button
          key={key}
          type="button"
          onClick={onClick}
          aria-pressed={active}
          className="gmc-tap inline-flex items-center px-3.5 py-2 text-[13px] font-bold rounded-[var(--gmc-r-ctl)] transition-all"
          style={{
            background: active ? "var(--gmc-teal)" : "white",
            color: active ? "white" : "var(--gmc-ink-2)",
            border: active
              ? "1.5px solid var(--gmc-teal)"
              : "1.5px solid var(--gmc-line-soft)",
            boxShadow: active ? "0 4px 12px rgba(20,181,175,0.22)" : "none",
          }}
          data-testid={testid}
        >
          {label}
        </button>
      );
    }
    return (
      <button
        key={key}
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className="gmc-chip"
        data-testid={testid}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="filter-chips">
      {chip(allActive, "__all", "All groups", onClear, "filter-all")}
      {groups.map((g) =>
        chip(
          activeGroups.includes(g),
          g,
          g,
          () => onToggle(g),
          `filter-group-${g.replace(/\s+/g, "-").toLowerCase()}`,
        ),
      )}
    </div>
  );
}
