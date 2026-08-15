import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";

const LS_KEY = "gmc_coach_seen";

/**
 * A one-time pointer at a control whose purpose is not visually obvious.
 *
 * The Comparing bar is the only route back to changing which insurers are
 * shown, and nothing about a row of logos says "this is a button". Rather than
 * add permanent chrome to a bar that exists to be quiet, this says it once and
 * then never again.
 *
 * Deliberately not a tooltip: a tooltip waits to be discovered, which is the
 * exact problem here. This appears unprompted and leaves on its own.
 *
 * Seen state is per-browser via localStorage. If storage is unavailable the
 * mark simply shows every time, which is the safe direction to fail.
 */
export default function CoachMark({
  id,
  show,
  children,
  className = "",
  autoHideMs = 7000,
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!show) return;
    let seen = false;
    try {
      seen = JSON.parse(window.localStorage.getItem(LS_KEY) || "{}")[id] === true;
    } catch (_err) { seen = false; }
    if (seen) return;
    setOpen(true);
  }, [show, id]);

  const dismiss = () => {
    setOpen(false);
    try {
      const all = JSON.parse(window.localStorage.getItem(LS_KEY) || "{}");
      all[id] = true;
      window.localStorage.setItem(LS_KEY, JSON.stringify(all));
    } catch (_err) {}
  };

  useEffect(() => {
    if (!open || !autoHideMs) return undefined;
    const t = setTimeout(dismiss, autoHideMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, autoHideMs]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={`absolute left-0 top-full mt-2 z-[45] ${className}`}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: reduce ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
          role="status"
          data-testid={`coach-${id}`}
        >
          {/* Arrow, pointing back up at the control */}
          <span
            className="absolute left-6 -top-1 w-2.5 h-2.5 rotate-45"
            style={{ background: "var(--gmc-ink)" }}
            aria-hidden="true"
          />
          <div
            className="relative flex items-center gap-2 pl-3 pr-1.5 py-2 rounded-[var(--gmc-r-ctl)] shadow-[var(--gmc-shadow-float)]"
            style={{ background: "var(--gmc-ink)" }}
          >
            <span className="gmc-t-sm gmc-w-strong" style={{ color: "white" }}>
              {children}
            </span>
            <button
              type="button"
              onClick={dismiss}
              className="gmc-tap-area flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0"
              aria-label="Dismiss"
              data-testid={`coach-${id}-dismiss`}
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} style={{ color: "white" }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
