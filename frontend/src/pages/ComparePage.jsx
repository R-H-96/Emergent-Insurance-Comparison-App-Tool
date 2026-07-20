import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import data from "@/data/gmc_tool_data.json";
import GmcNav from "@/components/GmcNav";
import Hero from "@/components/Hero";
import ProductTypeSelector from "@/components/ProductTypeSelector";
import InsurerPicker from "@/components/InsurerPicker";
import ComparisonSurface from "@/components/ComparisonSurface";
import DetailModal from "@/components/DetailModal";
import Disclaimer from "@/components/Disclaimer";
import AskCompact from "@/components/AskCompact";
import AskPanel from "@/components/AskPanel";
import ControlDock from "@/components/ControlDock";
import MobileBottomBar from "@/components/MobileBottomBar";
import useAskEngine from "@/hooks/useAskEngine";
import useMediaQuery from "@/hooks/useMediaQuery";
import { countNotableForSelection } from "@/lib/notable";
import { pushEvent } from "@/lib/analytics";

const LS_KEY = "gmc_last_selection";
const VALID_INSURER_IDS = new Set(data.insurers.map((i) => i.id));
const VALID_GROUPS = new Set(data.features.map((f) => f.group));

function readInitialState() {
  const params = new URLSearchParams(window.location.search);
  const parseCsv = (v, allow) =>
    v ? v.split(",").map((s) => decodeURIComponent(s.trim())).filter((s) => allow.has(s)) : null;

  let insurerIds = parseCsv(params.get("insurers"), VALID_INSURER_IDS);
  if (insurerIds && (insurerIds.length < 2 || insurerIds.length > 3)) insurerIds = null;

  const diffParam = params.get("diff");
  const diffOnly = diffParam === "1" || diffParam === "true" ? true : diffParam === "0" ? false : null;

  const activeGroups = parseCsv(params.get("groups"), VALID_GROUPS);
  const densityParam = params.get("density");
  const density = densityParam === "full" || densityParam === "glance" ? densityParam : null;

  let stored = null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch (_err) { stored = null; }

  return {
    insurers: insurerIds || (stored?.insurers?.length >= 2 && stored.insurers.every((id) => VALID_INSURER_IDS.has(id))
      ? stored.insurers
      : ["sc", "nib"]),
    diffOnly: diffOnly !== null ? diffOnly : !!stored?.diffOnly,
    activeGroups: activeGroups || (Array.isArray(stored?.activeGroups) ? stored.activeGroups.filter((g) => VALID_GROUPS.has(g)) : []),
    density: density || stored?.density || "glance",
  };
}

export default function ComparePage({ embed = false, initialGroups = [] }) {
  const initial = useMemo(() => readInitialState(), []);

  const [productType, setProductType] = useState("health");
  const [selected, setSelected] = useState(initial.insurers);
  const [diffOnly, setDiffOnly] = useState(initial.diffOnly);
  const [activeGroups, setActiveGroups] = useState(initial.activeGroups);
  const [density, setDensity] = useState(initial.density);
  const [openFeature, setOpenFeature] = useState(null);
  const [flashFeature, setFlashFeature] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const flashTimer = useRef(null);
  const firstMount = useRef(true);
  const isDesktop = useMediaQuery("(min-width: 1200px)");

  // Persist state to URL + localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("product", productType);
    params.set("insurers", selected.join(","));
    params.set("density", density);
    if (diffOnly) params.set("diff", "1"); else params.delete("diff");
    if (activeGroups.length) params.set("groups", activeGroups.join(",")); else params.delete("groups");

    window.history.replaceState(null, "",
      window.location.pathname + (params.toString() ? `?${params.toString()}` : "") + window.location.hash);

    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify({
        insurers: selected, diffOnly, activeGroups, density, savedAt: Date.now(),
      }));
    } catch (_err) {}

    if (firstMount.current) firstMount.current = false;
    else pushEvent("gmc_select_insurers", { insurers: selected });
  }, [productType, selected, diffOnly, activeGroups, density]);

  const selectedInsurers = useMemo(
    () => data.insurers.filter((i) => selected.includes(i.id)),
    [selected],
  );

  const lookup = useMemo(() => {
    const out = {};
    data.insurers.forEach((ins) => {
      out[ins.id] = {};
      (data.data[ins.id] || []).forEach((row) => { out[ins.id][row.feature] = row; });
    });
    return out;
  }, []);

  const groupList = useMemo(() => {
    const seen = new Set();
    const list = [];
    data.features.forEach((f) => { if (!seen.has(f.group)) { seen.add(f.group); list.push(f.group); } });
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

  const toggleGroup = (g) => setActiveGroups((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const preOpenGroups = initialGroups.length > 0 ? initialGroups : activeGroups.length > 0 ? activeGroups : undefined;

  const openFeatureAndTrack = (featureName) => {
    setOpenFeature(featureName);
    pushEvent("gmc_modal_open", { feature: featureName });
  };

  const locateFeature = (featureName) => {
    const feat = data.features.find((f) => f.feature === featureName);
    if (!feat) return;
    // Switch to Full comparison if we're in Glance mode
    if (density !== "full") setDensity("full");
    if (diffOnly) setDiffOnly(false);
    if (activeGroups.length > 0 && !activeGroups.includes(feat.group)) setActiveGroups([]);
    setTimeout(() => {
      const el = document.getElementById(`row-${featureName.replace(/\s+/g, "-").toLowerCase()}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashFeature(featureName);
      if (flashTimer.current) clearTimeout(flashTimer.current);
      flashTimer.current = setTimeout(() => setFlashFeature(null), 2300);
    }, 60);
  };

  const share = async () => {
    const url = window.location.href;
    const shareData = { title: "Compare NZ health insurance", text: "Side-by-side comparison", url };
    pushEvent("gmc_share", { method: "trigger", url });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        pushEvent("gmc_share", { method: "native" });
        return;
      } catch (_err) {}
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

  return (
    <div className={`min-h-screen ${embed ? "gmc-embed" : ""}`} data-testid="compare-page">
      {!embed && <GmcNav />}
      {!embed && <Hero />}

      {/* Product type + Picker section — only visible on first visit if no
          insurers picked, otherwise the InsurerStrip + ControlDock handles changes.
          We keep an initial picker below for onboarding + non-desktop viewports
          that haven't opened the mobile compare sheet yet. */}
      {!isDesktop && (
        <>
          <section className={embed ? "pt-6 sm:pt-10 pb-4" : "pb-4"} data-testid="product-type-section">
            <div className="gmc-container">
              <ProductTypeSelector value={productType} onChange={setProductType} />
            </div>
          </section>
          <section className="pb-6 sm:pb-8" data-testid="insurer-picker-section">
            <div className="gmc-container">
              <InsurerPicker insurers={data.insurers} selected={selected} onToggle={toggleInsurer} />
            </div>
          </section>
          <AskCompact askState={askState} examples={data.example_questions || []} onResultScroll={() => setAskOpen(true)} />
        </>
      )}

      <ComparisonSurface
        density={density}
        onDensityChange={setDensity}
        insurers={selectedInsurers}
        allInsurers={data.insurers}
        onToggleInsurer={toggleInsurer}
        features={data.features}
        data={data.data}
        glossary={data.glossary}
        lookup={lookup}
        groupList={groupList}
        activeGroups={activeGroups}
        onToggleGroup={toggleGroup}
        onClearGroups={() => setActiveGroups([])}
        diffOnly={diffOnly}
        onDiffOnlyChange={setDiffOnly}
        notableCount={notableCount}
        preOpenGroups={preOpenGroups}
        flashFeature={flashFeature}
        onOpenFeature={openFeatureAndTrack}
        onShare={share}
        linkCopied={linkCopied}
        onOpenPicker={() => setPickerOpen(true)}
      />

      <ControlDock
        insurers={selectedInsurers}
        allInsurers={data.insurers}
        onToggleInsurer={toggleInsurer}
        productType={productType}
        onProductType={setProductType}
        groups={groupList}
        activeGroups={activeGroups}
        onToggleGroup={toggleGroup}
        onClearGroups={() => setActiveGroups([])}
        diffOnly={diffOnly}
        onDiffOnlyChange={setDiffOnly}
        notableCount={notableCount}
        askOpen={askOpen}
        onToggleAsk={() => setAskOpen((o) => !o)}
        onShare={share}
        pickerOpen={pickerOpen}
        onPickerOpenChange={setPickerOpen}
      />

      <AskPanel
        open={askOpen}
        onClose={() => setAskOpen(false)}
        askState={askState}
        examples={data.example_questions || []}
        insurers={selectedInsurers}
        lookup={lookup}
        glossary={data.glossary}
        onLocate={locateFeature}
        onOpenFeature={openFeatureAndTrack}
      />

      <MobileBottomBar
        insurers={selectedInsurers}
        allInsurers={data.insurers}
        onToggleInsurer={toggleInsurer}
        productType={productType}
        onProductType={setProductType}
        groups={groupList}
        activeGroups={activeGroups}
        onToggleGroup={toggleGroup}
        onClearGroups={() => setActiveGroups([])}
        diffOnly={diffOnly}
        onDiffOnlyChange={setDiffOnly}
        notableCount={notableCount}
        onOpenAsk={() => setAskOpen(true)}
      />

      {embed ? (
        <section
          className="py-6 border-t"
          style={{ borderColor: "var(--gmc-line)", background: "var(--gmc-bg-alt)" }}
          data-testid="embed-disclaimer"
        >
          <div className="gmc-container">
            <p className="text-[12px] leading-relaxed" style={{ color: "var(--gmc-body)" }}>
              Summaries for general information only, not financial advice. Always confirm against the insurer&apos;s current policy document. Insurer logos are used to identify the products compared. Get My Cover is independent and is not affiliated with or endorsed by any insurer.
            </p>
          </div>
        </section>
      ) : (
        <Disclaimer />
      )}

      {/* Bottom spacer for mobile action bar */}
      <div className="h-20 md:hidden print:hidden" aria-hidden="true" />

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
