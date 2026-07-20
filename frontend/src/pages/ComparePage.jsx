import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
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
import TrustLine from "@/components/TrustLine";
import CTA from "@/components/CTA";
import AskAQuestion from "@/components/AskAQuestion";
import AskCompact from "@/components/AskCompact";
import ToolNav from "@/components/ToolNav";
import useAskEngine from "@/hooks/useAskEngine";
import { countNotableForSelection } from "@/lib/notable";
import { pushEvent } from "@/lib/analytics";

const LS_KEY = "gmc_last_selection";
const VALID_INSURER_IDS = new Set(data.insurers.map((i) => i.id));
const VALID_GROUPS = new Set(data.features.map((f) => f.group));

function readInitialState() {
  const params = new URLSearchParams(window.location.search);

  let insurerIds = null;
  const insurersParam = params.get("insurers");
  if (insurersParam) {
    insurerIds = insurersParam
      .split(",")
      .map((s) => s.trim())
      .filter((s) => VALID_INSURER_IDS.has(s));
    if (insurerIds.length < 2 || insurerIds.length > 3) insurerIds = null;
  }

  const diffParam = params.get("diff");
  let diffOnly = null;
  if (diffParam !== null) diffOnly = diffParam === "1" || diffParam === "true";

  let activeGroups = null;
  const groupsParam = params.get("groups");
  if (groupsParam) {
    activeGroups = groupsParam
      .split(",")
      .map((g) => decodeURIComponent(g.trim()))
      .filter((g) => VALID_GROUPS.has(g));
  }

  let stored = null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch (_err) {
    stored = null;
  }

  return {
    insurers:
      insurerIds ||
      (stored?.insurers &&
      stored.insurers.every((id) => VALID_INSURER_IDS.has(id)) &&
      stored.insurers.length >= 2 &&
      stored.insurers.length <= 3
        ? stored.insurers
        : ["sc", "nib"]),
    diffOnly: diffOnly !== null ? diffOnly : !!stored?.diffOnly,
    activeGroups:
      activeGroups ||
      (Array.isArray(stored?.activeGroups)
        ? stored.activeGroups.filter((g) => VALID_GROUPS.has(g))
        : []),
  };
}

export default function ComparePage({ embed = false, initialGroups = [] }) {
  const initial = useMemo(() => readInitialState(), []);

  const [productType, setProductType] = useState("health");
  const [selected, setSelected] = useState(initial.insurers);
  const [diffOnly, setDiffOnly] = useState(initial.diffOnly);
  const [activeGroups, setActiveGroups] = useState(initial.activeGroups);
  const [openFeature, setOpenFeature] = useState(null);
  const [flashFeature, setFlashFeature] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const flashTimer = useRef(null);
  const firstMount = useRef(true);

  // Persist state to URL + localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("product", productType);
    params.set("insurers", selected.join(","));
    if (diffOnly) params.set("diff", "1"); else params.delete("diff");
    if (activeGroups.length) params.set("groups", activeGroups.join(",")); else params.delete("groups");

    const newUrl =
      window.location.pathname +
      (params.toString() ? `?${params.toString()}` : "") +
      window.location.hash;
    window.history.replaceState(null, "", newUrl);

    try {
      window.localStorage.setItem(
        LS_KEY,
        JSON.stringify({
          insurers: selected,
          diffOnly,
          activeGroups,
          savedAt: Date.now(),
        }),
      );
    } catch (_err) { /* storage disabled */ }

    // gmc_select_insurers analytics (skip the first mount so we don't
    // spam on page load — only actual user changes count).
    if (firstMount.current) {
      firstMount.current = false;
    } else {
      pushEvent("gmc_select_insurers", { insurers: selected });
    }
  }, [productType, selected, diffOnly, activeGroups]);

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

  const notableCount = useMemo(
    () => countNotableForSelection(data.features, selectedInsurers, lookup),
    [selectedInsurers, lookup],
  );

  const currentFeature = useMemo(
    () => data.features.find((f) => f.feature === openFeature) || null,
    [openFeature],
  );

  const askState = useAskEngine({
    features: data.features,
    data: data.data,
    glossary: data.glossary,
    synonyms: data.synonyms,
  });

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

  const toggleGroup = (g) =>
    setActiveGroups((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );

  const preOpenGroups =
    initialGroups.length > 0
      ? initialGroups
      : activeGroups.length > 0
        ? activeGroups
        : undefined;

  const openFeatureAndTrack = (featureName) => {
    setOpenFeature(featureName);
    pushEvent("gmc_modal_open", { feature: featureName });
  };

  const locateFeature = (featureName) => {
    const rowId = `row-${featureName.replace(/\s+/g, "-").toLowerCase()}`;
    const feat = data.features.find((f) => f.feature === featureName);
    if (feat && diffOnly) setDiffOnly(false);
    if (feat && activeGroups.length > 0 && !activeGroups.includes(feat.group)) {
      setActiveGroups([]);
    }
    setTimeout(() => {
      const el = document.getElementById(rowId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashFeature(featureName);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlashFeature(null), 2300);
    }, 50);
  };

  const share = async () => {
    const url = window.location.href;
    const shareData = {
      title: "Compare NZ health insurance",
      text: "Have a look at this side-by-side comparison",
      url,
    };
    pushEvent("gmc_share", { method: "trigger", url });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        pushEvent("gmc_share", { method: "native" });
        return;
      } catch (_err) { /* user cancelled or unsupported — fall through */ }
    }
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast.success("Copied!");
      pushEvent("gmc_share", { method: "clipboard" });
      setTimeout(() => setLinkCopied(false), 1600);
    } catch (_err) {
      toast.error("Could not share — long-press the address bar instead.");
    }
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={`min-h-screen ${embed ? "gmc-embed" : ""}`}
      data-testid="compare-page"
    >
      {!embed && <GmcNav />}
      {!embed && <Hero />}

      <ToolNav
        insurers={selectedInsurers}
        allInsurers={data.insurers}
        onToggleInsurer={toggleInsurer}
        groups={groupList}
        activeGroups={activeGroups}
        onToggleGroup={toggleGroup}
        onClearGroups={() => setActiveGroups([])}
        onScrollToPicker={() => scrollTo("insurer-picker")}
        onScrollToTable={() => scrollTo("full-comparison")}
        onScrollToGlance={() => scrollTo("at-a-glance")}
        onScrollToAsk={() => scrollTo("ask-a-question")}
        onShare={share}
      />

      <section
        className={embed ? "pt-6 sm:pt-10 pb-6 sm:pb-8" : "pb-6 sm:pb-10"}
        data-testid="product-type-section"
      >
        <div className="gmc-container">
          <ProductTypeSelector value={productType} onChange={setProductType} />
        </div>
      </section>

      <section
        id="insurer-picker"
        className="pb-8 sm:pb-10"
        data-testid="insurer-picker-section"
      >
        <div className="gmc-container">
          <InsurerPicker
            insurers={data.insurers}
            selected={selected}
            onToggle={toggleInsurer}
          />
        </div>
      </section>

      <AskCompact
        askState={askState}
        examples={data.example_questions || []}
        onResultScroll={() => scrollTo("ask-a-question")}
      />

      <AtAGlance
        features={data.features}
        insurers={selectedInsurers}
        lookup={lookup}
        glossary={data.glossary}
        notableCount={notableCount}
        onOpen={openFeatureAndTrack}
      />

      <section
        id="full-comparison"
        className="pb-10 sm:pb-14"
        data-testid="comparison-table-section"
      >
        <div className="gmc-container">
          <TrustLine data={data.data} />
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
                  quick definition — tap them. Notable-difference rows are
                  marked with a teal edge.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  className="gmc-chip gmc-tap"
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
                  Notable only ({notableCount})
                </button>
                <button
                  type="button"
                  className="gmc-chip gmc-tap"
                  onClick={share}
                  data-testid="copy-link-btn"
                  aria-label="Share this comparison"
                >
                  {linkCopied ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" strokeWidth={2.2} />
                  )}
                  {linkCopied ? "Copied" : "Share"}
                </button>
              </div>
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
            flashFeature={flashFeature}
            onOpenFeature={openFeatureAndTrack}
          />
        </div>
      </section>

      <AskAQuestion
        askState={askState}
        examples={data.example_questions || []}
        glossary={data.glossary}
        insurers={selectedInsurers}
        lookup={lookup}
        onLocate={locateFeature}
        onOpenFeature={openFeatureAndTrack}
      />

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

      {/* Bottom spacer so the sticky mobile CTA doesn't hide footer content */}
      <div className="h-20 md:hidden print:hidden" aria-hidden="true" />

      <DetailModal
        feature={currentFeature}
        insurers={selectedInsurers}
        lookup={lookup}
        glossary={data.glossary}
        onClose={() => setOpenFeature(null)}
      />

      {/* Mobile sticky bottom adviser CTA */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3 print:hidden"
        style={{
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--gmc-line)",
        }}
        data-testid="mobile-sticky-cta"
      >
        <CTA
          label="Talk to an adviser — free"
          data-testid="mobile-sticky-adviser"
          {...{ style: { width: "100%" } }}
        />
      </div>
    </div>
  );
}
