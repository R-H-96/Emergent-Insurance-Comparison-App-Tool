import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import App from "@/App";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

// Embedded on the Webflow site the host page provides #gmc-root. Standalone
// (GitHub Pages) it is #root. The .gmc-app class carries the scoped reset, so
// the app styles itself without touching anything around it.
const container =
  document.getElementById("gmc-root") || document.getElementById("root");
container.classList.add("gmc-app");
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
