import "@/App.css";
import { useEffect } from "react";
import { toast, Toaster } from "sonner";
import ComparePage from "@/pages/ComparePage";

function App() {
  // Global delegated handler for CTA buttons carrying `gmc-quote-trigger`.
  // The production site binds its own modal to this class; our preview shows a toast
  // so the developer/reviewer sees the trigger fired without adding per-element onClicks.
  useEffect(() => {
    const handler = (e) => {
      const target = e.target.closest(".gmc-quote-trigger");
      if (!target) return;
      toast.message("Adviser booking modal", {
        description:
          "On the live GMC site, the global modal opens here — this preview intentionally has no per-button handler.",
      });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="App">
      <ComparePage />
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
