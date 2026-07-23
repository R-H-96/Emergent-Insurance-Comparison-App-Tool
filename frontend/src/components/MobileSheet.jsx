import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion, useDragControls } from "framer-motion";
import { X } from "lucide-react";

/**
 * Reusable full-featured mobile bottom sheet.
 *
 * Architecture:
 *   Outer motion.div — fixed inset-0, handles opacity fade + backdrop click
 *   Backdrop button — absolute inset-0, covers the FULL screen
 *   Positioning wrapper — absolute inset-x-0 bottom-0, top constrained to
 *     max(safe-area-inset-top, 56px). Sheet panel can never appear above this
 *     line regardless of maxHeight or browser dvh/svh support.
 *   Sheet panel — inside the wrapper, slides up via y animation
 */
export default function MobileSheet({
  open,
  onClose,
  title,
  eyebrow,
  titleIcon,
  testId = "mobile-sheet",
  children,
  footer,
  maxHeight = "88dvh",
}) {
  const resolvedMaxHeight =
    typeof maxHeight === "string" ? maxHeight.replace(/vh$/, "dvh") : maxHeight;
  const reduce = useReducedMotion();
  const dragControls = useDragControls();
  const bodyRef = useRef(null);
  const historyPushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    const originalPadRight = document.body.style.paddingRight;
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPadRight;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const openedAt = Date.now();
    window.history.pushState({ __gmcSheet: true }, "");
    historyPushedRef.current = true;
    const onPop = () => {
      if (Date.now() - openedAt < 150) return;
      historyPushedRef.current = false;
      onCloseRef.current?.();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (historyPushedRef.current && window.history.state?.__gmcSheet) {
        historyPushedRef.current = false;
        window.history.back();
      }
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onCloseRef.current?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="gmc-sheet-root"
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          data-testid={testId}
        >
          {/* Backdrop — full screen, sits behind the sheet */}
          <motion.button
            type="button"
            aria-label="Close sheet"
            className="absolute inset-0 w-full h-full bg-black/50 cursor-default"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            data-testid={`${testId}-backdrop`}
          />

          {/*
           * Positioning wrapper — constrained so the sheet panel can never
           * appear above the status bar / notch area. The `top` value pushes
           * the wrapper down by at least 56px (or the safe-area inset if
           * larger), and overflow:hidden clips any animation overshoot.
           */}
          <div
            className="absolute inset-x-0 bottom-0 flex items-end justify-center overflow-hidden"
            style={{ top: "max(env(safe-area-inset-top, 0px), 56px)" }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title || "Sheet"}
              className="relative w-full max-w-[720px] bg-white rounded-t-[var(--gmc-r-card)] overflow-hidden flex flex-col shadow-[0_-8px_40px_rgba(0,0,0,0.18)]"
              style={{ maxHeight: resolvedMaxHeight }}
              initial={reduce ? { y: 0 } : { y: "100%" }}
              animate={{ y: 0 }}
              exit={reduce ? { y: 0 } : { y: "100%" }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 38 }}
              drag={reduce ? false : "y"}
              dragListener={false}
              dragControls={dragControls}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_e, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) onClose();
              }}
              data-testid={`${testId}-panel`}
            >
              {/* Drag handle + sticky header */}
              <div
                className="sticky top-0 z-10 flex-shrink-0 bg-white border-b"
                style={{ borderColor: "var(--gmc-line)", touchAction: "none" }}
                onPointerDown={(e) => { if (!reduce) dragControls.start(e); }}
              >
                <div className="flex justify-center pt-2 pb-1">
                  <div
                    className="h-1.5 w-10 rounded-full"
                    style={{ background: "var(--gmc-line)" }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex items-start justify-between gap-3 px-5 pb-3">
                  <div className="min-w-0 flex-1">
                    {eyebrow && (
                      <div
                        className="text-[11px] font-bold uppercase tracking-[0.1em] mb-1"
                        style={{ color: "var(--gmc-teal-mid)" }}
                      >
                        {eyebrow}
                      </div>
                    )}
                    {title && (
                      <h2
                        className="text-[18px] leading-tight font-extrabold flex items-center gap-2"
                        style={{ color: "var(--gmc-ink)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {titleIcon}
                        <span>{title}</span>
                      </h2>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="gmc-tap flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 hover:bg-[color:var(--gmc-bg-alt)]"
                    aria-label="Close"
                    data-testid={`${testId}-close`}
                  >
                    <X className="w-5 h-5" style={{ color: "var(--gmc-body)" }} strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div
                ref={bodyRef}
                className="flex-1 overflow-y-auto overscroll-contain thin-scrollbar"
                style={{
                  paddingBottom: footer ? 0 : "calc(env(safe-area-inset-bottom, 0px) + 16px)",
                }}
                data-testid={`${testId}-body`}
              >
                {children}
              </div>

              {footer && (
                <div
                  className="flex-shrink-0 border-t bg-white"
                  style={{
                    borderColor: "var(--gmc-line)",
                    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
                  }}
                >
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
