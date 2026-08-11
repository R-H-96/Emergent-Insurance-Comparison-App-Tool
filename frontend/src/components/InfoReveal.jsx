import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MobileSheet from "@/components/MobileSheet";
import useMediaQuery from "@/hooks/useMediaQuery";

/**
 * One tap-to-explain primitive, used by every small reveal in the tool:
 * glossary terms, source citations, and the state markers.
 *
 * On a phone it opens a bottom sheet rather than a popover. Radix popovers
 * render at z-50 while MobileSheet sits at z-[9990], so any reveal opened from
 * inside a sheet (the detail view, the picker, the radar area panel) rendered
 * underneath it and looked like nothing had happened. Raising z-indexes would
 * fix that one symptom; using the sheet removes the whole class of problem, and
 * a sheet is a better touch target anyway.
 *
 * The trigger stops propagation because these sit inside rows that are
 * themselves clickable.
 */
export default function InfoReveal({
  children, eyebrow, title, body, footer,
  triggerClassName = "", triggerStyle, ariaLabel, testId,
  side = "top", align = "center", width = "w-72",
}) {
  const isMobile = !useMediaQuery("(min-width: 768px)");
  const [open, setOpen] = useState(false);

  const stop = (e) => e.stopPropagation();

  // Stated inline, not left to the cascade. The host page's stylesheet sets a
  // background on button elements, and matching its specificity from our own
  // sheet is a fight we lose the moment the host changes. Callers can still
  // override by passing their own background in triggerStyle.
  const baseTriggerStyle = {
    backgroundColor: "transparent",
    backgroundImage: "none",
    border: 0,
    padding: 0,
    boxShadow: "none",
    ...triggerStyle,
  };

  const Trigger = (
    <button
      type="button"
      onClick={(e) => { stop(e); if (isMobile) setOpen(true); }}
      onMouseDown={stop}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") stop(e); }}
      className={triggerClassName}
      style={baseTriggerStyle}
      aria-label={ariaLabel || title}
      data-testid={testId}
    >
      {children}
    </button>
  );

  const Body = (
    <>
      {eyebrow && (
        <div
          className="gmc-t-xs gmc-w-strong uppercase tracking-[0.1em] mb-1"
          style={{ color: "var(--gmc-teal-mid)" }}
        >
          {eyebrow}
        </div>
      )}
      {title && (
        <div className="gmc-w-heavy gmc-t-base mb-1" style={{ color: "var(--gmc-ink)" }}>
          {title}
        </div>
      )}
      <div className="gmc-t-base sm:gmc-t-sm leading-relaxed" style={{ color: "var(--gmc-body)" }}>
        {body}
      </div>
      {footer}
    </>
  );

  if (isMobile) {
    return (
      <>
        {Trigger}
        <MobileSheet
          open={open}
          onClose={() => setOpen(false)}
          testId={`${testId || "info"}-sheet`}
          scrollKey={title || ""}
          maxHeight="min(70dvh, 560px)"
        >
          <div className="p-5 pt-1">{Body}</div>
        </MobileSheet>
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{Trigger}</PopoverTrigger>
      <PopoverContent
        className={`${width} max-w-[calc(100vw-2rem)] bg-white border rounded-[var(--gmc-r-ctl)] p-4 shadow-[var(--gmc-shadow-float)]`}
        style={{ borderColor: "var(--gmc-line)", zIndex: 9995 }}
        side={side}
        align={align}
        collisionPadding={12}
        onClick={stop}
      >
        {Body}
      </PopoverContent>
    </Popover>
  );
}
