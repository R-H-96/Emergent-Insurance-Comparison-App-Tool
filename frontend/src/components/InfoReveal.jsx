import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import MobileSheet from "@/components/MobileSheet";
import useMediaQuery from "@/hooks/useMediaQuery";

/**
 * One tap-to-explain primitive, used by every small reveal in the tool:
 * glossary terms, source citations, and the state markers.
 *
 * On a phone it opens a bottom sheet rather than a popover. Radix popovers
 * render at z-50 while MobileSheet sits at z-[90], so any reveal opened from
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

  const Trigger = (
    <button
      type="button"
      onClick={(e) => { stop(e); if (isMobile) setOpen(true); }}
      onMouseDown={stop}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") stop(e); }}
      className={triggerClassName}
      style={triggerStyle}
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
          className="text-[11px] font-bold uppercase tracking-[0.1em] mb-1"
          style={{ color: "var(--gmc-teal-mid)" }}
        >
          {eyebrow}
        </div>
      )}
      {title && (
        <div className="font-extrabold text-[15px] sm:text-[14px] mb-1" style={{ color: "var(--gmc-ink)" }}>
          {title}
        </div>
      )}
      <div className="text-[14.5px] sm:text-[13px] leading-relaxed" style={{ color: "var(--gmc-body)" }}>
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
        className={`${width} max-w-[calc(100vw-2rem)] bg-white border rounded-[16px] p-4 shadow-[0_12px_40px_rgba(22,28,39,0.12)]`}
        style={{ borderColor: "var(--gmc-line)", zIndex: 95 }}
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
