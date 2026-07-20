import { useCallback, useRef, useState } from "react";
import { matchQuestion } from "@/lib/askEngine";
import { pushEvent } from "@/lib/analytics";

const STORAGE_KEY = "gmc_feedback_questions";
export const FEEDBACK_ENDPOINT =
  "https://api-ap1.hsforms.com/submissions/v3/integration/submit/442950127/e3e79a97-c315-4aba-838d-696d3ef1774d";
const SEARCH_DELAY_MS = 800;

function buildHubSpotPayload(question, matchedFeature) {
  return {
    fields: [
      { objectTypeId: "0-1", name: "question_text", value: question },
      { objectTypeId: "0-1", name: "matched_feature", value: matchedFeature || "" },
      { objectTypeId: "0-1", name: "page_path", value: window.location.pathname + window.location.search },
    ],
    context: {
      pageUri: window.location.href,
      pageName: document.title || "GMC Compare",
    },
  };
}

/**
 * Shared "ask" state hook used by both the compact ask bar and the full
 * ask section. One source of truth so a submit in one place shows up in the
 * other, and metrics/beacons only fire once per submit.
 */
export default function useAskEngine({ features, data, glossary, synonyms }) {
  const [question, setQuestion] = useState("");
  const [status, setStatus] = useState("idle"); // idle | searching | match | nomatch
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]); // {q, matched, feature, at}
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
    const body = JSON.stringify(payload);
    // Endpoint verified to accept application/json + CORS from any origin as
    // long as credentials are omitted. Use fetch (with keepalive) rather than
    // navigator.sendBeacon because sendBeacon can't set Content-Type: application/json
    // and HubSpot rejects text/plain (415).
    try {
      fetch(FEEDBACK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        mode: "cors",
        credentials: "omit",
        keepalive: true,
      })
        .then((r) => {
          if (window.__GMC_LOG_FEEDBACK__) {
            // eslint-disable-next-line no-console
            console.log("[gmc feedback]", r.status);
          }
        })
        .catch(() => {});
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
        sendBeacon(buildHubSpotPayload(q, matchedFeature));
        if (match) {
          setResult(match);
          setStatus("match");
        } else {
          setStatus("nomatch");
        }
        setHistory((h) => [
          { q, matched: !!match, feature: match?.feature || null, at: Date.now() },
          ...h,
        ].slice(0, 20));
      }, SEARCH_DELAY_MS);
    },
    [question, features, data, glossary, synonyms],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setResult(null);
  }, []);

  return { question, setQuestion, status, result, history, submit, reset };
}
