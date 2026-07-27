import CTA from "@/components/CTA";
import TrustStrip from "@/components/TrustStrip";

/**
 * Two states.
 *
 * Full: the marketing hero, for anyone arriving cold.
 *
 * Compact: shown once someone has been through the intake. The full hero tells
* the reader to "pick two or three insurers", which they just did, four
* questions ago and then costs them a full screen of scrolling before they
 * reach their own answer. After the intake the page's job is to show the
 * comparison, not to re-pitch the tool.
 */
export default function Hero({ compact = false }) {
  if (compact) {
    return (
      <section className="pt-6 pb-2" id="compare" data-testid="hero-compact">
        <div className="gmc-container">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="gmc-eyebrow" style={{ color: "var(--gmc-teal)" }}>
                NZ health insurance · side-by-side
              </div>
              <h1
                className="gmc-h1 text-2xl sm:text-3xl mt-1"
                style={{ color: "var(--gmc-ink)" }}
              >
                Your comparison
              </h1>
            </div>
            <div className="hidden sm:block">
              <CTA compact data-testid="hero-cta" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="pt-10 sm:pt-16 pb-8 sm:pb-12"
      id="compare"
      data-testid="hero-section"
    >
      <div className="gmc-container">
        <div className="max-w-3xl">
          <div className="gmc-eyebrow mb-4" style={{ color: "var(--gmc-teal)" }}>
            NZ health insurance · side-by-side
          </div>
          <h1 className="gmc-h1 text-4xl sm:text-5xl lg:text-6xl">
            Compare five NZ health policies,
            <br />
            <span style={{ color: "var(--gmc-teal-deep)" }}>
              with the wording on the table.
            </span>
          </h1>
          <p
            className="mt-6 text-base sm:text-lg max-w-2xl"
            style={{ color: "var(--gmc-body)" }}
          >
            Pick two or three insurers. See what each one actually covers,
straight from the policy document, every value cited, every gap
            visible. We describe the differences; a licensed adviser gives the
            advice.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <CTA data-testid="hero-cta" />
            <TrustStrip />
          </div>
        </div>
      </div>
    </section>
  );
}
