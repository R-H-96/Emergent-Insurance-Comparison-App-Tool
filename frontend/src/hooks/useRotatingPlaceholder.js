import { useEffect, useState } from "react";

/**
 * Cycles through a list of placeholder strings, changing every `intervalMs`.
 * `focused` pauses the cycle. `enabled=false` freezes at the first item.
 */
export default function useRotatingPlaceholder(examples, {
  intervalMs = 3500,
  focused = false,
  enabled = true,
} = {}) {
  const list = Array.isArray(examples) && examples.length > 0 ? examples : [""];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!enabled || focused || list.length < 2) return undefined;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % list.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [enabled, focused, intervalMs, list.length]);

  return `Try: “${list[idx]}”`;
}
