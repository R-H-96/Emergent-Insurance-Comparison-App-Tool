import { useMemo, useState } from "react";
import data from "@/data/gmc_tool_data.json";
import GmcNav from "@/components/GmcNav";
import Hero from "@/components/Hero";
import ProductTypeSelector from "@/components/ProductTypeSelector";
import InsurerPicker from "@/components/InsurerPicker";
import ComparisonTable from "@/components/ComparisonTable";
import Disclaimer from "@/components/Disclaimer";
import TrustStrip from "@/components/TrustStrip";
import CTA from "@/components/CTA";

export default function ComparePage() {
  const [productType, setProductType] = useState("health");
  const [selected, setSelected] = useState(["sc", "nib"]);
  const [diffOnly, setDiffOnly] = useState(false);

  const selectedInsurers = useMemo(
    () => data.insurers.filter((i) => selected.includes(i.id)),
    [selected],
  );

  const toggleInsurer = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        // don't drop below 2
        if (prev.length <= 2) return prev;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen" data-testid="compare-page">
      <GmcNav />
      <Hero />

      <section className="pb-8 sm:pb-12" data-testid="product-type-section">
        <div className="gmc-container">
          <ProductTypeSelector
            value={productType}
            onChange={setProductType}
          />
        </div>
      </section>

      <section className="pb-10 sm:pb-14" data-testid="insurer-picker-section">
        <div className="gmc-container">
          <InsurerPicker
            insurers={data.insurers}
            selected={selected}
            onToggle={toggleInsurer}
          />
        </div>
      </section>

      <section className="pb-12 sm:pb-16" data-testid="comparison-table-section">
        <div className="gmc-container">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <div className="gmc-eyebrow mb-2">Side-by-side comparison</div>
              <h2 className="gmc-h2 text-2xl sm:text-3xl">
                {selectedInsurers.length} policies · what each one says
              </h2>
              <p className="mt-2 text-sm max-w-2xl">
                Every cell shows the value, the exact source (document · version
                · page), and whether it&apos;s been human-verified yet. Tap a
                group to collapse it.
              </p>
            </div>
            <button
              type="button"
              className="gmc-chip self-start sm:self-auto"
              aria-pressed={diffOnly}
              onClick={() => setDiffOnly((v) => !v)}
              data-testid="differences-only-toggle"
            >
              <span
                className="gmc-toggle"
                aria-pressed={diffOnly}
                aria-hidden="true"
                tabIndex={-1}
              />
              Differences only
            </button>
          </div>

          <ComparisonTable
            insurers={selectedInsurers}
            features={data.features}
            data={data.data}
            diffOnly={diffOnly}
          />
        </div>
      </section>

      <section className="pb-14 sm:pb-20" data-testid="cta-section">
        <div className="gmc-container">
          <div className="gmc-card p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
            <div>
              <h3 className="gmc-h3 text-xl sm:text-2xl">
                Ready to make sense of the differences?
              </h3>
              <p className="mt-2 text-sm max-w-xl">
                A licensed adviser walks you through which of these differences
                actually matter for your circumstances. Free — you don&apos;t
                pay them, the insurer does.
              </p>
              <div className="mt-4">
                <TrustStrip />
              </div>
            </div>
            <div>
              <CTA data-testid="footer-cta" />
              <p className="mt-2 text-xs text-center" style={{ color: "var(--gmc-muted)" }}>
                Paid by the insurer, never by you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
