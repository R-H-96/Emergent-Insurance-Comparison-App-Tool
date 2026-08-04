/**
 * Uniform tile that displays an insurer logo (or an accent-tinted initial
 * tile fallback). Trimming whitespace was done at build time; we constrain
 * with object-contain in an equal-height frame so all logos sit evenly.
 */
export default function InsurerLogo({ insurer, size = 40, className = "" }) {
  const hasLogo = !!insurer.logo;
  const initials = insurer.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className={`flex items-center justify-center rounded-[var(--gmc-r-ctl)] overflow-hidden flex-shrink-0 ${className}`}
      style={{
        width: size * 1.6,
        height: size,
        background: hasLogo ? "white" : insurer.accent,
        border: hasLogo ? "1px solid var(--gmc-line)" : "none",
      }}
      data-testid={`insurer-logo-${insurer.id}`}
    >
      {hasLogo ? (
        <img
          src={`${process.env.PUBLIC_URL || ""}${insurer.logo}`}
          alt={`${insurer.name} logo`}
          className="max-h-[70%] max-w-[85%] object-contain"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span
          className="text-white gmc-w-heavy"
          style={{
            fontSize: size * 0.4,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
