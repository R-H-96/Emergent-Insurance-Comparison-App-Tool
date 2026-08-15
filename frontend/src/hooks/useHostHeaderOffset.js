import { useEffect } from "react";

/**
 * Measures the host page's fixed header and writes its height into
 * --gmc-sticky-offset, so the tool's sticky bar stops exactly beneath it.
 *
 * Why measure rather than configure
 * ---------------------------------
 * This was a hand-set number in the embed snippet. The Webflow nav is 73px and
 * the snippet said 80px, which left a 7px band of bare content scrolling
 * between the two. Nobody would ever notice they had drifted apart, and any
 * change to the nav silently reintroduces the gap. A measured value cannot
 * drift, and it re-measures on resize, so a nav that grows on mobile is
 * handled without anyone editing anything.
 *
 * What counts as the host header
 * ------------------------------
 * Deliberately narrow, because guessing wrong here pushes the whole tool down
 * the page. An element qualifies only if it is position: fixed, pinned to the
 * very top, spans most of the viewport, and is a plausible header height. Our
 * own overlays are excluded, since they are fixed and full width too.
 *
 * If nothing qualifies, the variable is left alone, so the standalone build
 * and any hand-set value both keep working.
 */
const MIN_HEIGHT = 32;
const MAX_HEIGHT = 200;

function measureHostHeader() {
  if (typeof document === "undefined") return null;

  const vw = window.innerWidth;
  let tallest = 0;

  for (const el of document.body.querySelectorAll("*")) {
    // Never measure ourselves. The tool's own sheets, dialogs and the portal
    // host are fixed and full width, and would read as enormous headers.
    if (el.closest(".gmc-app, #gmc-root, #gmc-portal-host")) continue;

    const cs = window.getComputedStyle(el);
    if (cs.position !== "fixed" || cs.display === "none" || cs.visibility === "hidden") continue;

    const r = el.getBoundingClientRect();
    if (r.height < MIN_HEIGHT || r.height > MAX_HEIGHT) continue;
    if (r.width < vw * 0.8) continue;
    // Pinned to the top. A small tolerance covers borders and sub-pixel layout.
    if (r.top > 2 || r.bottom <= 0) continue;

    tallest = Math.max(tallest, r.bottom);
  }

  return tallest > 0 ? Math.round(tallest) : null;
}

export default function useHostHeaderOffset(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof document === "undefined") return undefined;

    const target = document.getElementById("gmc-root") || document.documentElement;

    const apply = () => {
      const h = measureHostHeader();
      if (h === null) return;
      target.style.setProperty("--gmc-sticky-offset", `${h}px`);
    };

    // Once now, and again after fonts and any header script have settled,
    // because a nav that renders its own markup can change height late.
    apply();
    const settle = setTimeout(apply, 600);

    window.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);

    return () => {
      clearTimeout(settle);
      window.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, [enabled]);
}
