import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Wraps a small visual marker so it explains itself in place.
 *
 * This replaces the separate legend row. A legend asks the reader to hold a
 * mapping in their head and carry it back to the thing they were looking at;
 * making the marker itself tappable removes that step, removes a row of chrome,
 * and — unlike a `title` tooltip — actually works on a touchscreen.
 */
export default function MarkerInfo({ title, children, label, className = "" }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") e.stopPropagation(); }}
          className={`inline-flex items-center flex-shrink-0 cursor-help rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gmc-teal)] ${className}`}
          aria-label={label || title}
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 bg-white border rounded-[14px] p-3.5 shadow-[0_12px_40px_rgba(22,28,39,0.12)]"
        style={{ borderColor: "var(--gmc-line)" }}
        side="top"
        align="center"
        onClick={(e) => e.stopPropagation()}
        data-testid="marker-popover"
      >
        <div className="font-extrabold text-[13px] mb-1" style={{ color: "var(--gmc-ink)" }}>
          {title}
        </div>
        <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--gmc-body)" }}>
          {label}
        </div>
      </PopoverContent>
    </Popover>
  );
}
