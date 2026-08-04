import { Component } from "react";
import { AlertTriangle } from "lucide-react";
import CTA from "@/components/CTA";
import { pushEvent } from "@/lib/analytics";

/**
 * Last line of defence.
 *
 * This tool is embedded inside someone else's page. Without a boundary, a
* single unexpected null. A missing insurer, a malformed row after a data
* update. Unmounts the whole React tree and leaves a blank rectangle on a live
 * site, with nothing telling the visitor what happened or what to do instead.
 *
 * So a failure degrades to the thing the tool exists to produce anyway: a route
 * to an adviser. The error is pushed to the dataLayer so a silent breakage in
 * production is still visible in analytics.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, detail: "" };
  }

  static getDerivedStateFromError(error) {
    return { failed: true, detail: String(error?.message || error).slice(0, 300) };
  }

  componentDidCatch(error, info) {
    pushEvent("gmc_error", {
      message: String(error?.message || error).slice(0, 200),
      component: String(info?.componentStack || "").split("\n")[1]?.trim().slice(0, 120) || "",
      path: typeof window !== "undefined" ? window.location.pathname + window.location.search : "",
    });
    // eslint-disable-next-line no-console
    console.error("[gmc] comparison tool failed to render", error, info);
  }

  handleReset = () => {
    // A bad saved selection is the likeliest cause we can actually recover from.
    try {
      window.localStorage.removeItem("gmc_last_selection");
      window.localStorage.removeItem("gmc_intake_v1");
    } catch (_err) { /* storage disabled */ }
    window.location.href = window.location.pathname;
  };

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <section className="py-12 sm:py-20" data-testid="error-boundary">
        <div className="gmc-container" style={{ maxWidth: 640 }}>
          <div className="gmc-card p-6 sm:p-8 text-center">
            <span
              className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
              className="gmc-inset"
            >
              <AlertTriangle
                className="w-6 h-6"
                strokeWidth={2.2}
                style={{ color: "var(--gmc-body)" }}
                aria-hidden="true"
              />
            </span>
            <h2 className="gmc-h2 text-2xl mb-2">This comparison didn&apos;t load</h2>
            <p className="gmc-t-base leading-relaxed mb-5" style={{ color: "var(--gmc-body)" }}>
              Something went wrong on our side, not yours. You can start again, or skip
              straight to someone who can answer your questions directly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                className="gmc-btn-outline gmc-tap"
                onClick={this.handleReset}
                data-testid="error-reset"
              >
                Start again
              </button>
              <CTA data-testid="error-cta" />
            </div>
            <p className="gmc-t-sm mt-5" style={{ color: "var(--gmc-muted)" }}>
              Summaries for general information only, not financial advice.
            </p>
          </div>
        </div>
      </section>
    );
  }
}
