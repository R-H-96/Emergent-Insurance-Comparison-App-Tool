import { useEffect, useState } from "react";

/**
 * Returns true if the CSS media query currently matches.
 * Updates on viewport resize.
 */
export default function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const listener = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    if (mql.addEventListener) mql.addEventListener("change", listener);
    else mql.addListener(listener);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", listener);
      else mql.removeListener(listener);
    };
  }, [query]);

  return matches;
}
