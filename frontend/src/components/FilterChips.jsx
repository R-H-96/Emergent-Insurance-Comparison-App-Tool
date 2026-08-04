import { groupLabel } from "@/lib/personalisation";
/**
* FilterChips, group filter selector.
 *
 * Two visual modes controlled by the `filled` prop:
* Default (inline): compact chips. They WRAP from sm upwards, the labels are
 *     long enough now that a single scrolling row hid the last few sections
 *     behind a fade with no way to reach them on a mouse. Below sm they scroll
 *     horizontally (with a visible scrollbar) so they don't eat the screen.
 *   Filled: larger chips in a wrapped grid with teal active fill. Used
 *     inside sheets (FAB Compare tab).
 *
 * "All groups" and individual groups are mutually exclusive.
 */
export default function FilterChips({ groups, activeGroups, onToggle, onClear, filled = false }) {
  const allActive = activeGroups.length === 0;

  if (filled) {
    return (
      <div className="flex flex-wrap items-center gap-2" data-testid="filter-chips">
        <FilledChip
          active={allActive}
          onClick={onClear}
          label="All groups"
          testid="filter-all"
        />
        {groups.map((g) => (
          <FilledChip
            key={g}
            active={activeGroups.includes(g)}
            onClick={() => onToggle(g)}
            label={groupLabel(g)}
            testid={`filter-group-${g.replace(/\s+/g, "-").toLowerCase()}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative" data-testid="filter-chips">
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-0.5 thin-scrollbar sm:flex-wrap sm:overflow-visible"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <InlineChip
          active={allActive}
          onClick={onClear}
          label="All groups"
          testid="filter-all"
        />
        {groups.map((g) => (
          <InlineChip
            key={g}
            active={activeGroups.includes(g)}
            onClick={() => onToggle(g)}
            label={groupLabel(g)}
            testid={`filter-group-${g.replace(/\s+/g, "-").toLowerCase()}`}
          />
        ))}
        {/* Spacer so the last chip doesn’t sit behind the right-fade gradient */}
        <div className="w-8 flex-shrink-0 sm:hidden" aria-hidden="true" />
      </div>
      {/* Right-edge fade to hint at overflow */}
      <div
        className="pointer-events-none absolute right-0 inset-y-0 w-10 sm:hidden"
        style={{ background: "linear-gradient(to right, transparent, var(--gmc-bg))" }}
        aria-hidden="true"
      />
    </div>
  );
}

function InlineChip({ active, onClick, label, testid }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="gmc-tap inline-flex items-center px-3 py-1.5 gmc-t-sm gmc-w-strong rounded-full flex-shrink-0 whitespace-nowrap transition-all"
      style={{
        background: active ? "var(--gmc-teal-tint-2)" : "var(--gmc-bg-alt)",
        color: active ? "var(--gmc-teal-deep)" : "var(--gmc-body)",
        border: `1.5px solid ${active ? "var(--gmc-teal)" : "var(--gmc-line)"}`,
      }}
      data-testid={testid}
    >
      {label}
    </button>
  );
}

function FilledChip({ active, onClick, label, testid }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="gmc-tap inline-flex items-center px-3.5 py-2 gmc-t-sm gmc-w-strong rounded-[var(--gmc-r-ctl)] transition-all"
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
