import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion, useDragControls } from "framer-motion";
import { X } from "lucide-react";

/**
 * Reusable full-featured mobile bottom sheet.
 *
 * Architecture:
* Backdrop, fixed inset-0 z-[9989], separate AnimatePresence
* Sheet panel. Fixed inset-x-0 bottom-0 z-[9990], no outer wrapper.
 *     maxHeight: calc(100dvh - max(env(safe-area-inset-top), 56px)) ensures the
 *     panel can never extend above the status bar regardless of dvh support.
 *
 * Drag-to-dismiss:
 *   Always available from the drag handle / sticky header (touchAction:none).
 *   Also available from the top 80px of the scrollable body when body is at
* scrollTop=0. Natural pull-to-dismiss without needing the handle.
 *
 * Props:
* scrollKey. When this changes while open, body resets to scrollTop=0.
 *                 Pass feature.feature in DetailModal to prevent stale scroll.
* headerExtra. Optional node rendered between title row and body as a
 *                 flex-shrink-0 slot (e.g. tab bars in MobileFAB).
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
  maxHeight,
  scrollKey,
  headerExtra,
}) {
  const reduce = useReducedMotion();
  const dragControls = useDragControls();
  const bodyRef = useRef(null);
  const [bodyAtTop, setBodyAtTop] = useState(true);
  const historyPushedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  // Body scroll lock
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

// History API (browser-back to close), StrictMode-safe 150ms guard
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

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onCloseRef.current?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

// Scroll reset. Runs when sheet opens OR content key changes
  useEffect(() => {
    if (open && bodyRef.current) {
      bodyRef.current.scrollTop = 0;
      setBodyAtTop(true);
    }
  }, [open, scrollKey]);

  const handleBodyScroll = () => {
    setBodyAtTop((bodyRef.current?.scrollTop ?? 1) < 10);
  };

  // Pull-to-dismiss from top of body: start drag when body is at top and
  // the touch starts within 80px of the body's top edge.
  const handleBodyPointerDown = (e) => {
    if (reduce || !bodyAtTop) return;
    const rect = bodyRef.current?.getBoundingClientRect();
    if (rect && e.clientY - rect.top < 80) {
      dragControls.start(e);
    }
  };

  // Default: fill all available viewport height below the status bar.
  const sheetMaxHeight =
    maxHeight ?? "calc(100dvh - max(env(safe-area-inset-top, 0px), 56px))";

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.button
            key="gmc-sheet-backdrop"
            type="button"
            aria-label="Close sheet"
            className="fixed inset-0 z-[9989] w-full h-full bg-black/50 cursor-default"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            data-testid={`${testId}-backdrop`}
          />
        )}
      </AnimatePresence>

{/* Sheet panel. Fixed directly to the viewport bottom */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="gmc-sheet-panel"
            role="dialog"
            aria-modal="true"
            aria-label={title || "Sheet"}
            className="fixed inset-x-0 bottom-0 z-[9990] flex flex-col bg-white rounded-t-[var(--gmc-r-card)] overflow-hidden shadow-[var(--gmc-shadow-float)]"
            style={{ maxHeight: sheetMaxHeight }}
            initial={reduce ? { opacity: 0, y: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1, y: 0 } : { y: 0 }}
            exit={reduce ? { opacity: 0, y: 0 } : { y: "100%" }}
            transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 38 }}
            drag={reduce ? false : "y"}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) onClose();
            }}
            data-testid={testId}
          >
{/* Drag handle + sticky header. Entire zone is a drag target */}
            <div
              className="flex-shrink-0 bg-white border-b"
              style={{ borderColor: "var(--gmc-line)" }}
            >
              {/* Handle pill */}
              <div
                className="flex justify-center pt-3 pb-2"
                style={{ touchAction: "none" }}
                onPointerDown={(e) => { if (!reduce) dragControls.start(e); }}
              >
                <div
                  className="h-[5px] w-12 rounded-full"
                  style={{ background: "var(--gmc-line)" }}
                  aria-hidden="true"
                />
              </div>
              <div className="flex items-start justify-between gap-3 px-5 pb-3">
                <div className="min-w-0 flex-1">
                  {eyebrow && (
                    <div
                      className="gmc-t-xs gmc-w-strong uppercase tracking-[0.1em] mb-1"
                      style={{ color: "var(--gmc-teal-mid)" }}
                    >
                      {eyebrow}
                    </div>
                  )}
                  {title && (
                    <h2
                      className="gmc-t-lg leading-tight gmc-w-heavy flex items-center gap-2"
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

            {/* Non-scrolling slot for tab bars etc. */}
            {headerExtra && (
              <div className="flex-shrink-0">
                {headerExtra}
              </div>
            )}

            {/* Scrollable body */}
            <div
              ref={bodyRef}
              className="flex-1 overflow-y-auto overscroll-contain thin-scrollbar"
              style={{
                touchAction: "pan-y",
                paddingBottom: footer ? 0 : "calc(env(safe-area-inset-bottom, 0px) + 16px)",
              }}
              onScroll={handleBodyScroll}
              onPointerDown={handleBodyPointerDown}
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
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
