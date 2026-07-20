export default function FilterChips({ groups, activeGroups, onToggle, onClear }) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      data-testid="filter-chips"
    >
      <button
        type="button"
        className="gmc-chip"
        aria-pressed={activeGroups.length === 0}
        onClick={onClear}
        data-testid="filter-all"
      >
        All groups
      </button>
      {groups.map((g) => (
        <button
          key={g}
          type="button"
          className="gmc-chip"
          aria-pressed={activeGroups.includes(g)}
          onClick={() => onToggle(g)}
          data-testid={`filter-group-${g.replace(/\s+/g, "-").toLowerCase()}`}
        >
          {g}
        </button>
      ))}
    </div>
  );
}
