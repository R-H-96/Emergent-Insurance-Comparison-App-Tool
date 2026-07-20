import "@/App.css";
import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import ComparePage from "@/pages/ComparePage";
import data from "@/data/gmc_tool_data.json";

function App() {
  const [urlState, setUrlState] = useState({ embed: false, groups: [] });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const val = params.get("embed");
    const isEmbed = val === "1" || val === "true";

    // Accept groups=Core%20limits,Cancer%20care (comma-separated, URL-decoded)
    const groupsParam = params.get("groups");
    const validGroups = new Set(data.features.map((f) => f.group));
    let groups = [];
    if (groupsParam) {
      groups = groupsParam
        .split(",")
        .map((g) => decodeURIComponent(g.trim()))
        .filter((g) => validGroups.has(g));
    }
    setUrlState({ embed: isEmbed, groups });
  }, []);

  // Global delegated handler for `.gmc-quote-trigger` — production site binds
  // its own modal here. Preview shows a toast so devs/reviewers see the fire.
  useEffect(() => {
    const handler = (e) => {
      const target = e.target.closest(".gmc-quote-trigger");
      if (!target) return;
      toast.message("Adviser booking modal", {
        description:
          "On the live GMC site the global modal opens here — this preview intentionally has no per-button handler.",
      });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const initialGroups = useMemo(() => urlState.groups, [urlState.groups]);

  return (
    <div
      className="App"
      data-embed={urlState.embed ? "1" : "0"}
      data-groups={urlState.groups.join(",") || undefined}
    >
      <ComparePage embed={urlState.embed} initialGroups={initialGroups} />
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
