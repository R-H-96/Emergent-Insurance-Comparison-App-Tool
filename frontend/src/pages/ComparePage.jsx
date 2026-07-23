import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import data from "@/data/gmc_tool_data.json";
import GmcNav from "@/components/GmcNav";
import Hero from "@/components/Hero";
import ProductTypeSelector from "@/components/ProductTypeSelector";
import InsurerPicker from "@/components/InsurerPicker";
import InsurerMark from "@/components/InsurerMark";
import ComparisonSurface from "@/components/ComparisonSurface";
import DetailModal from "@/components/DetailModal";
import Disclaimer from "@/components/Disclaimer";
import AskCompact from "@/components/AskCompact";
import AskPanel from "@/components/AskPanel";
import AskLaunchBubble from "@/components/AskLaunchBubble";
import ControlDock from "@/components/ControlDock";
import MobileFAB from "@/components/MobileFAB";
import useAskEngine from "@/hooks/useAskEngine";
import useMediaQuery from "@/hooks/useMediaQuery";
import useCompareContextBridge from "@/hooks/useCompareContextBridge";
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

  useCompareContextBridge({ productType, selectedInsurers });

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
    setAskOpen(false);
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

  const openGroup = (group) => {
    if (density !== "full") setDensity("full");
    if (diffOnly) setDiffOnly(false);
    setActiveGroups([group]);
    setTimeout(() => {
      document.getElementById("comparison-surface")?.scrollIntoView({ behavior: "smooth", block: "start" });
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

  const pickerCollapsed = selected.length >= 2;

  return (
    <div className={`min-h-screen ${embed ? "gmc-embed" : ""}`} data-testid="compare-page">
      {!embed && <GmcNav />}
      {!embed && <Hero />}

      {/* Mobile insurer picker: collapsed strip when already comparing, full picker for onboarding */}
      {!isDesktop && (
        <AnimatePresence mode="wait" initial={false}>
          {pickerCollapsed ? (
            <motion.div
              key="picker-collapsed"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="pb-3"
            >
              <div className="gmc-container">
                <button
                  type="button"
                  className="gmc-tap w-full flex items-center justify-between gap-3 px-4 py-3 rounded-[var(--gmc-r-ctl)] transition-colors"
                  style={{
                    background: "var(--gmc-teal-tint)",
                    border: "1px solid var(--gmc-line)",
                  }}
                  onClick={() => setPickerOpen(true)}
                  data-testid="picker-collapsed-strip"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex flex-shrink-0">
                      {selectedInsurers.map((ins, i) => (
                        <div
                          key={ins.id}
                          style={{
                            width: 34,
                            height: 34,
                            marginLeft: i > 0 ? -10 : 0,
                            boxShadow: "0 0 0 2.5px white",
                            borderRadius: "50%",
                            position: "relative",
                            zIndex: selectedInsurers.length - i,
                            display: "flex",
                            flexShrink: 0,
                          }}
                        >
                          <InsurerMark insurer={ins} size={34} />
                        </div>
                      ))}
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-[10px] font-bold uppercase tracking-[0.1em]"
                        style={{ color: "var(--gmc-teal-mid)" }}
                      >
                        Comparing
                      </div>
                      <div
                        className="text-[13px] font-extrabold leading-tight truncate"
                        style={{ color: "var(--gmc-ink)" }}
                      >
                        {selectedInsurers.map((i) => i.name).join(" vs ")}
                      </div>
                    </div>
                  </div>
                  <Pencil
                    className="w-4 h-4 flex-shrink-0"
                    strokeWidth={2}
                    style={{ color: "var(--gmc-teal-mid)" }}
                  />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="picker-expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <section
                className={embed ? "pt-6 sm:pt-10 pb-4" : "pb-4"}
                data-testid="product-type-section"
              >
                <div className="gmc-container">
                  <ProductTypeSelector value={productType} onChange={setProductType} />
                </div>
              </section>
              <section className="pb-6 sm:pb-8" data-testid="insurer-picker-section">
                <div className="gmc-container">
                  <InsurerPicker
                    insurers={data.insurers}
                    selected={selected}
                    onToggle={toggleInsurer}
                  />
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Desktop-only ask bar above comparison surface */}
      {isDesktop && (
        <AskCompact
          askState={askState}
          examples={data.example_questions || []}
          onResultScroll={() => setAskOpen(true)}
        />
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
        onOpenGroup={openGroup}
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
        onShare={share}
        pickerOpen={pickerOpen}
        onPickerOpenChange={setPickerOpen}
      />

      {/* Desktop: floating ask bubble + panel */}
      {isDesktop && (
        <>
          <AskLaunchBubble
            open={askOpen}
            onToggle={() => setAskOpen((o) => !o)}
            hidden={!!openFeature}
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
        </>
      )}

      {/* Mobile: unified floating action button (Ask + Compare) */}
      <MobileFAB
        askState={askState}
        examples={data.example_questions || []}
        insurers={selectedInsurers}
        lookup={lookup}
        glossary={data.glossary}
        onLocate={locateFeature}
        onOpenFeature={openFeatureAndTrack}
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
        hidden={!!openFeature}
        compareOpen={pickerOpen}
        onCompareOpenChange={setPickerOpen}
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

      {/* Bottom clearance so FAB doesn’t obscure last content on mobile */}
      <div className="h-16 xl:hidden print:hidden" aria-hidden="true" />

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
