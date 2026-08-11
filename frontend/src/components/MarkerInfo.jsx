import InfoReveal from "@/components/InfoReveal";

/**
 * Wraps a small visual marker so it explains itself in place.
 *
 * A legend asks the reader to memorise a mapping and carry it back to the thing
 * they were looking at. Making the marker itself tappable removes that step and,
 * unlike a `title` tooltip, works on a touchscreen.
 */
export default function MarkerInfo({ title, children, label, className = "" }) {
  return (
    <InfoReveal
      title={title}
      body={label}
      ariaLabel={label || title}
      testId="marker"
      width="w-64"
      // gmc-tap-area, not gmc-tap. These markers sit inline inside dense rows,
      // so growing them to 44px on screen would wreck the row. The class
      // extends only the hit area, leaving the badge the size it looks.
      triggerClassName={`gmc-tap-area inline-flex items-center flex-shrink-0 cursor-help rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gmc-teal)] ${className}`}
    >
      {children}
    </InfoReveal>
  );
}
