import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

/**
 * Reusable full-featured mobile bottom sheet.
 *
 * Features:
 *   • Framer-motion drag-down-to-dismiss (only fires close after > 120px OR velocity > 500)
 *   • Backdrop tap to close
 *   • Browser back-button closes the sheet (History API pushState/popState)
 *   • Body scroll lock while open — internal <body> scrolls independently
 *   • Sticky, always-visible branded header with title + X close button
 *   • Safe-area-inset-bottom aware body padding
 *   • ESC key close
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
  maxHeight = "92dvh",
}) {
  // Normalise any legacy "vh" callers to dynamic viewport height so the
  // sticky header (and its close X) never sits behind iOS Safari's chrome.
  const resolvedMaxHeight =
    typeof maxHeight === "string" ? maxHeight.replace(/vh$/, "dvh") : maxHeight;
  const reduce = useReducedMotion();
  const bodyRef = useRef(null);
  const historyPushedRef = useRef(false);
  // Keep the latest onClose in a ref so effects don't re-fire on prop identity changes
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Body scroll lock while sheet is open
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

  // History API back-button integration (StrictMode-safe via time guard).
  useEffect(() => {
    if (!open) return;
    const openedAt = Date.now();
    window.history.pushState({ __gmcSheet: true }, "");
    historyPushedRef.current = true;
    const onPop = () => {
      // StrictMode's double-mount pattern can cause a spurious popstate to
      // fire immediately after mount; ignore anything within the first 150ms.
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

  // ESC key close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const content = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="gmc-sheet-root"
          className="fixed inset-0 z-[90] flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          data-testid={testId}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close sheet"
            className="absolute inset-0 w-full h-full bg-black/50 cursor-default"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            data-testid={`${testId}-backdrop`}
          />

          {/* Sheet body — draggable */}
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
              style={{ borderColor: "var(--gmc-line)" }}
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
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
