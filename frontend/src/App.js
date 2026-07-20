import "@/App.css";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import ComparePage from "@/pages/ComparePage";

function App() {
  const [embed, setEmbed] = useState(false);

  // Detect ?embed=1 (or ?embed=true) once on mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const val = params.get("embed");
    if (val === "1" || val === "true") setEmbed(true);
  }, []);

  // Global delegated handler for CTA buttons carrying `gmc-quote-trigger`.
  // The production site binds its own modal to this class; our preview shows a
  // toast so a reviewer sees the trigger fired without adding per-element onClicks.
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

  return (
    <div className="App" data-embed={embed ? "1" : "0"}>
      <ComparePage embed={embed} />
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
