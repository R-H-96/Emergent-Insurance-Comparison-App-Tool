import CTA from "@/components/CTA";
import TrustStrip from "@/components/TrustStrip";

export default function Hero() {
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
            straight from the policy document — every value cited, every gap
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
