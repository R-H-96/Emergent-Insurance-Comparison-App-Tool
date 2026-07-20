import { useMemo, useState } from "react";
import data from "@/data/gmc_tool_data.json";
import GmcNav from "@/components/GmcNav";
import Hero from "@/components/Hero";
import ProductTypeSelector from "@/components/ProductTypeSelector";
import InsurerPicker from "@/components/InsurerPicker";
import AtAGlance from "@/components/AtAGlance";
import FilterChips from "@/components/FilterChips";
import ComparisonTable from "@/components/ComparisonTable";
import DetailModal from "@/components/DetailModal";
import Disclaimer from "@/components/Disclaimer";
import TrustStrip from "@/components/TrustStrip";
import CTA from "@/components/CTA";
import Feedback from "@/components/Feedback";

export default function ComparePage({ embed = false, initialGroups = [] }) {
  const [productType, setProductType] = useState("health");
  const [selected, setSelected] = useState(["sc", "nib"]);
  const [diffOnly, setDiffOnly] = useState(false);
  const [activeGroups, setActiveGroups] = useState(initialGroups);
  const [openFeature, setOpenFeature] = useState(null);

  const selectedInsurers = useMemo(
    () => data.insurers.filter((i) => selected.includes(i.id)),
    [selected],
  );

  const lookup = useMemo(() => {
    const out = {};
    data.insurers.forEach((ins) => {
      out[ins.id] = {};
      (data.data[ins.id] || []).forEach((row) => {
        out[ins.id][row.feature] = row;
      });
    });
    return out;
  }, []);

  const groupList = useMemo(() => {
    const seen = new Set();
    const list = [];
    data.features.forEach((f) => {
      if (!seen.has(f.group)) {
        seen.add(f.group);
        list.push(f.group);
      }
    });
    return list;
  }, []);

  const currentFeature = useMemo(
    () => data.features.find((f) => f.feature === openFeature) || null,
    [openFeature],
  );

  const toggleInsurer = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const toggleGroup = (g) => {
    setActiveGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  };

  // Pre-open groups in the table:
  // - If initialGroups came in from URL, open exactly those
  // - Else if user has filtered via chips, open the filtered groups
  // - Else default (Core limits only, handled by ComparisonTable)
  const preOpenGroups =
    initialGroups.length > 0
      ? initialGroups
      : activeGroups.length > 0
        ? activeGroups
        : undefined;

  return (
    <div
      className={`min-h-screen ${embed ? "gmc-embed" : ""}`}
      data-testid="compare-page"
    >
      {!embed && <GmcNav />}
      {!embed && <Hero />}

      <section
        className={embed ? "pt-6 sm:pt-10 pb-6 sm:pb-8" : "pb-6 sm:pb-10"}
        data-testid="product-type-section"
      >
        <div className="gmc-container">
          <ProductTypeSelector value={productType} onChange={setProductType} />
        </div>
      </section>

      <section className="pb-8 sm:pb-12" data-testid="insurer-picker-section">
        <div className="gmc-container">
          <InsurerPicker
            insurers={data.insurers}
            selected={selected}
            onToggle={toggleInsurer}
          />
        </div>
      </section>

      <AtAGlance
        features={data.features}
        insurers={selectedInsurers}
        lookup={lookup}
        glossary={data.glossary}
        onOpen={(featureName) => setOpenFeature(featureName)}
      />

      <section
        className="pb-10 sm:pb-14"
        id="compare"
        data-testid="comparison-table-section"
      >
        <div className="gmc-container">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="gmc-eyebrow mb-2">Full comparison</div>
                <h2 className="gmc-h2 text-2xl sm:text-3xl">
                  {selectedInsurers.length} policies · side by side
                </h2>
                <p
                  className="mt-2 text-sm max-w-2xl"
                  style={{ color: "var(--gmc-body)" }}
                >
                  Tap any row to see the full policy wording, source citation
                  and verification status. Terms with a dotted underline have a
                  quick definition — tap them.
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
                Notable differences only
              </button>
            </div>

            <FilterChips
              groups={groupList}
              activeGroups={activeGroups}
              onToggle={toggleGroup}
              onClear={() => setActiveGroups([])}
            />
          </div>

          <ComparisonTable
            insurers={selectedInsurers}
            features={data.features}
            data={data.data}
            glossary={data.glossary}
            diffOnly={diffOnly}
            activeGroups={activeGroups}
            openGroups={preOpenGroups}
            onOpenFeature={(featureName) => setOpenFeature(featureName)}
          />
        </div>
      </section>

      <Feedback />

      {!embed && (
        <section className="pb-14 sm:pb-20" data-testid="cta-section">
          <div className="gmc-container">
            <div className="gmc-card p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center gap-6 justify-between">
              <div>
                <h3 className="gmc-h3 text-xl sm:text-2xl">
                  Ready to make sense of the differences?
                </h3>
                <p
                  className="mt-2 text-sm max-w-xl"
                  style={{ color: "var(--gmc-body)" }}
                >
                  A licensed adviser walks you through which of these
                  differences actually matter for your circumstances. Free —
                  you don&apos;t pay them, the insurer does.
                </p>
                <div className="mt-4">
                  <TrustStrip />
                </div>
              </div>
              <div>
                <CTA data-testid="footer-cta" />
                <p
                  className="mt-2 text-xs text-center"
                  style={{ color: "var(--gmc-muted)" }}
                >
                  Paid by the insurer, never by you.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {embed ? (
        <section
          className="py-6 border-t"
          style={{
            borderColor: "var(--gmc-line)",
            background: "var(--gmc-bg-alt)",
          }}
          data-testid="embed-disclaimer"
        >
          <div className="gmc-container">
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: "var(--gmc-body)" }}
            >
              Summaries for general information only, not financial advice.
              Always confirm against the insurer&apos;s current policy document.
              Insurer logos are used to identify the products compared. Get My
              Cover is independent and is not affiliated with or endorsed by any
              insurer.
            </p>
          </div>
        </section>
      ) : (
        <Disclaimer />
      )}

      <DetailModal
        feature={currentFeature}
        insurers={selectedInsurers}
        lookup={lookup}
        glossary={data.glossary}
        onClose={() => setOpenFeature(null)}
      />
    </div>
  );
}
