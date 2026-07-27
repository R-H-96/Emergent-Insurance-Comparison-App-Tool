import { useEffect, useRef } from "react";

const LS_KEY = "gmc_compare_context";

/**
 * Privacy-restricted context bridge.
 *
 * On any click that lands inside an element carrying the `.gmc-quote-trigger`
 * class (or descends into one), we write a minimal snapshot to localStorage
 * so the host site's HubSpot form can read it after redirect:
 *
 *     {
 *       product:    "Health",
 *       insurers:   [{ id, name, product }, ...],
 *       timestamp:  "2026-02-21T09:12:41.123Z"
 *     }
 *
* Rules. Do NOT include anything else. No Ask questions, no filters, no
 * scroll/route/browsing state. The host site is responsible for all consent
 * UI; this component performs no consent gating itself.
 *
 * Uses a capture-phase document listener so it fires regardless of where
 * the trigger button sits (adviser CTA, mobile bottom bar, detail modal).
 */
export default function useCompareContextBridge({ productType, selectedInsurers }) {
  const stateRef = useRef({ productType, selectedInsurers });
  useEffect(() => {
    stateRef.current = { productType, selectedInsurers };
  }, [productType, selectedInsurers]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onClick = (evt) => {
      const target = evt.target;
      if (!(target instanceof Element)) return;
      const hit = target.closest(".gmc-quote-trigger");
      if (!hit) return;
      try {
        const { productType: p, selectedInsurers: ins } = stateRef.current;
        const payload = {
          product: p,
          insurers: (ins || []).map((i) => ({
            id: i.id,
            name: i.name,
            product: i.product,
          })),
          timestamp: new Date().toISOString(),
        };
        window.localStorage.setItem(LS_KEY, JSON.stringify(payload));
      } catch (_err) {
/* localStorage disabled / quota, ignore silently */
      }
    };

    document.addEventListener("click", onClick, true); // capture-phase
    return () => document.removeEventListener("click", onClick, true);
  }, []);
}
