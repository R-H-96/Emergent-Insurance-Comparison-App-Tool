import { useCallback, useRef, useState } from "react";
import { matchQuestion } from "@/lib/askEngine";
import { pushEvent } from "@/lib/analytics";

const STORAGE_KEY = "gmc_feedback_questions";
export const FEEDBACK_ENDPOINT = ""; // paste Formspree URL here — empty = disabled
const SEARCH_DELAY_MS = 800;

/**
 * Shared "ask" state hook used by both the compact ask bar and the full
 * ask section. One source of truth so a submit in one place shows up in the
 * other, and metrics/beacons only fire once per submit.
 */
export default function useAskEngine({ features, data, glossary, synonyms }) {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState("idle"); // idle | searching | match | nomatch
  const [result, setResult] = useState(null);
  const searchTimer = useRef(null);

  const persistLocal = (q) => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push({
        q,
        at: new Date().toISOString(),
        path: typeof window !== "undefined" ? window.location.pathname : "",
      });
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (_err) { /* storage disabled */ }
  };

  const sendBeacon = (payload) => {
    if (!FEEDBACK_ENDPOINT) return;
    try {
      const body = new Blob([JSON.stringify(payload)], { type: "application/json" });
      if (navigator.sendBeacon) navigator.sendBeacon(FEEDBACK_ENDPOINT, body);
      else fetch(FEEDBACK_ENDPOINT, { method: "POST", body, keepalive: true }).catch(() => {});
    } catch (_err) { /* ignore */ }
  };

  const submit = useCallback(
    (raw) => {
      const q = (raw ?? question).trim();
      if (!q) return;
      setQuestion(q);
      persistLocal(q);
      setStatus("searching");
      setResult(null);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        const match = matchQuestion(q, { features, data, glossary, synonyms });
        const matchedFeature = match?.feature?.feature || null;
        pushEvent("gmc_question_asked", {
          question: q,
          matched: !!match,
          matched_feature: matchedFeature,
        });
        sendBeacon({
          question: q,
          matched_feature: matchedFeature,
          path: window.location.pathname + window.location.search,
          timestamp: new Date().toISOString(),
        });
        if (match) {
          setResult(match);
          setStatus("match");
        } else {
          setStatus("nomatch");
        }
      }, SEARCH_DELAY_MS);
    },
    [question, features, data, glossary, synonyms],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
  }, []);

  return { question, setQuestion, status, result, submit, reset };
}
