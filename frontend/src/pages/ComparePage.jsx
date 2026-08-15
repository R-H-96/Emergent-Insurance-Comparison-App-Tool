import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import data from "@/data/gmc_tool_data.json";
import GmcNav from "@/components/GmcNav";
import Hero from "@/components/Hero";
import ComparisonSurface from "@/components/ComparisonSurface";
import IntakeFlow from "@/components/IntakeFlow";
import DetailModal from "@/components/DetailModal";
import Disclaimer from "@/components/Disclaimer";
import AskPanel from "@/components/AskPanel";
import AskLaunchBubble from "@/components/AskLaunchBubble";
import MobileFAB from "@/components/MobileFAB";
import PrintSummary from "@/components/PrintSummary";
import ComparisonInfo from "@/components/ComparisonInfo";
import GlossaryPanel from "@/components/GlossaryPanel";
import InsurerPickerDialog from "@/components/InsurerPickerDialog";
import useAskEngine from "@/hooks/useAskEngine";
import useMediaQuery from "@/hooks/useMediaQuery";
import useCompareContextBridge from "@/hooks/useCompareContextBridge";
import { countNotableForSelection } from "@/lib/notable";
import { pushEvent } from "@/lib/analytics";
import {
  loadIntake, saveIntake, DEFAULT_INTAKE, explanationMode, priorityGroups,
} from "@/lib/personalisation";

const LS_KEY = "gmc_last_selection";
const VALID_INSURER_IDS = new Set(data.insurers.map((i) => i.id));
const VALID_GROUPS = new Set(data.features.map((f) => f.group));
const VALID_LEVELS = [0, 1, 2];

export const featureSlug = (name) => name.replace(/\s+/g, "-").toLowerCase();

function readInitialState() {
  const params = new URLSearchParams(window.location.search);
  const parseCsv = (v, allow) =>
    v ? v.split(",").map((s) => decodeURIComponent(s.trim())).filter((s) => allow.has(s)) : null;

  let insurerIds = parseCsv(params.get("insurers"), VALID_INSURER_IDS);
  if (insurerIds && (insurerIds.length < 2 || insurerIds.length > 3)) insurerIds = null;

  const activeGroups = parseCsv(params.get("groups"), VALID_GROUPS);

// ?feature=<slug> opens that comparison directly, shareable, and the hook
  // the head-to-head pages need.
  const featureSlug = params.get("feature");

  // `level` is the new disclosure ladder. `density` is still honoured so old
  // shared links (?density=glance|full) keep working.
  const levelParam = parseInt(params.get("level"), 10);
  const densityParam = params.get("density");
  const legacyLevel = densityParam === "full" ? 2 : densityParam === "glance" ? 1 : null;
  const level = VALID_LEVELS.includes(levelParam) ? levelParam : legacyLevel;

  let stored = null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch (_err) { stored = null; }

  return {
    // Deliberately empty. Preselecting a pair is an editorial choice about
    // which insurers get seen, and one an insurer could reasonably object to.
    // The reader picks, or a shared link says who.
    insurers:
      insurerIds ||
      (stored?.insurers?.length >= 2 && stored.insurers.every((id) => VALID_INSURER_IDS.has(id))
        ? stored.insurers
        : []),
    activeGroups:
      activeGroups ||
      (Array.isArray(stored?.activeGroups)
        ? stored.activeGroups.filter((g) => VALID_GROUPS.has(g))
        : []),
    level: level !== null ? level : (VALID_LEVELS.includes(stored?.level) ? stored.level : null),
    featureSlug,
  };
}

export default function ComparePage({ embed = false, initialGroups = [] }) {
  const initial = useMemo(() => readInitialState(), []);
  const savedIntake = useMemo(() => loadIntake(), []);

  const [productType, setProductType] = useState("health");
  const [selected, setSelected] = useState(initial.insurers);
  const [activeGroups, setActiveGroups] = useState(initial.activeGroups);
  const [intake, setIntake] = useState(savedIntake);

  // One-time coach mark on the Comparing bar. Shown after the intake, because
  // that bar is the only route back to changing the insurers and nothing about
  // it currently says so.
  const [coachPicker, setCoachPicker] = useState(false);

  // Show the intake unless they've already been through it (or skipped it),
  // or unless a shared link already encodes an explicit selection.
  const arrivedViaSharedLink = initial.level !== null || !!initial.featureSlug;
  const [showIntake, setShowIntake] = useState(
    (!embed && !savedIntake.completed && !savedIntake.skipped && !arrivedViaSharedLink) ||
      initial.insurers.length < 2,
  );

  const explanation = useMemo(() => explanationMode(intake.knowledge), [intake.knowledge]);
  const [level, setLevel] = useState(
    initial.level !== null ? initial.level : explanation.defaultLevel,
  );

  const [openFeature, setOpenFeature] = useState(() => {
    if (!initial.featureSlug) return null;
    const hit = data.features.find((f) => featureSlug(f.feature) === initial.featureSlug);
    return hit ? hit.feature : null;
  });
  const [flashFeature, setFlashFeature] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const flashTimer = useRef(null);
  const firstMount = useRef(true);
  const isDesktop = useMediaQuery("(min-width: 1200px)");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("product", productType);
    params.set("insurers", selected.join(","));
    params.set("level", String(level));
    params.delete("density");
    params.delete("diff");
    if (activeGroups.length) params.set("groups", activeGroups.join(",")); else params.delete("groups");
    if (openFeature) params.set("feature", featureSlug(openFeature)); else params.delete("feature");
    window.history.replaceState(
      null, "",
      window.location.pathname + (params.toString() ? `?${params.toString()}` : "") + window.location.hash,
    );
    try {
      window.localStorage.setItem(
        LS_KEY,
        JSON.stringify({ insurers: selected, activeGroups, level, savedAt: Date.now() }),
      );
    } catch (_err) {}
    if (firstMount.current) firstMount.current = false;
    else pushEvent("gmc_select_insurers", { insurers: selected });
  }, [productType, selected, activeGroups, level, openFeature]);

  // Keeps the tab label, bookmarks and shared-link previews meaningful.
  useEffect(() => {
    const names = data.insurers
      .filter((i) => selected.includes(i.id))
      .map((i) => i.name)
      .join(" vs ");
const feat = openFeature ? `${openFeature}, `: "";
    document.title = names
      ? `${feat}${names} | Compare NZ health insurance | Get My Cover`
      : "Compare NZ health insurance | Get My Cover";
  }, [selected, openFeature]);

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
    data.features.forEach((f) => {
      if (!seen.has(f.group)) { seen.add(f.group); list.push(f.group); }
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
    setActiveGroups((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));

  // When the table opens, lead with the sections they said they care about.
  const preOpenGroups =
    initialGroups.length > 0
      ? initialGroups
      : activeGroups.length > 0
        ? activeGroups
        : priorityGroups(intake).length > 0
          ? priorityGroups(intake)
          : undefined;

  const openFeatureAndTrack = (featureName) => {
    setOpenFeature(featureName);
    pushEvent("gmc_modal_open", { feature: featureName });
  };

  const finishIntake = (answers) => {
    const next = { ...DEFAULT_INTAKE, ...answers };
    setIntake(next);
    saveIntake(next);
    // The intake now asks which product first, so it owns that choice. Only
    // health has data behind it, so anything else falls back rather than
    // rendering an empty comparison.
    if (answers.product) setProductType(answers.product);
    setLevel(explanationMode(next.knowledge).defaultLevel);
    setShowIntake(false);
    setCoachPicker(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const skipIntake = () => {
    const next = { ...DEFAULT_INTAKE, skipped: true };
    setIntake(next);
    saveIntake(next);
    setLevel(1);
    setCoachPicker(true);
    // Skipping the questions still requires a choice of insurers. We do not
    // pick for them.
    if (selected.length >= 2) setShowIntake(false);
    else setPickerOpen(true);
  };

  const reopenIntake = () => {
    pushEvent("gmc_intake_reopen", {});
    setShowIntake(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const locateFeature = (featureName) => {
    const feat = data.features.find((f) => f.feature === featureName);
    if (!feat) return;
    setAskOpen(false);
    if (level !== 2) setLevel(2);
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
    setLevel(2);
    setActiveGroups([group]);
    setTimeout(() => {
      document.getElementById("comparison-surface")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const share = async () => {
    const url = window.location.href;
    pushEvent("gmc_share", { method: "trigger", url });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Compare NZ health insurance",
          text: "Side-by-side comparison",
          url,
        });
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
toast.error("Could not share, long-press the address bar instead.");
    }
  };

  if (showIntake) {
    return (
      <div className={`min-h-screen gmc-fab-clearance ${embed ? "gmc-embed" : ""}`} data-testid="compare-page">
        {!embed && <GmcNav />}
        <IntakeFlow
          insurers={data.insurers}
          selected={selected}
          onToggleInsurer={toggleInsurer}
          onComplete={finishIntake}
          onSkip={skipIntake}
        />
        {embed ? null : <Disclaimer />}
      </div>
    );
  }

  return (
    <div className={`min-h-screen gmc-fab-clearance ${embed ? "gmc-embed" : ""}`} data-testid="compare-page">
      {!embed && <div className="print:hidden"><GmcNav /></div>}
      {!embed && (
        <div className="print:hidden">
          <Hero
            compact={intake.completed || intake.skipped}
            action={
              (intake.completed || intake.skipped) && selectedInsurers.length > 0 ? (
                <ComparisonInfo
                  intake={intake}
                  insurers={selectedInsurers}
                  onEditIntake={reopenIntake}
                  onShare={share}
                  onPrint={() => { pushEvent("gmc_print", { level }); window.print(); }}
                />
              ) : null
            }
          />
        </div>
      )}

      <PrintSummary
        features={data.features}
        insurers={selectedInsurers}
        lookup={lookup}
        intake={intake}
      />

      <ComparisonSurface
        coachPicker={coachPicker}
        level={level}
        onLevelChange={setLevel}
        insurers={selectedInsurers}
        features={data.features}
        data={data.data}
        glossary={data.glossary}
        lookup={lookup}
        groupList={groupList}
        activeGroups={activeGroups}
        onToggleGroup={toggleGroup}
        onClearGroups={() => setActiveGroups([])}
        notableCount={notableCount}
        intake={intake}
        explanation={explanation}
        preOpenGroups={preOpenGroups}
        flashFeature={flashFeature}
        onOpenFeature={openFeatureAndTrack}
        onOpenGroup={openGroup}
        onShare={share}
        linkCopied={linkCopied}
        onOpenPicker={() => setPickerOpen(true)}
        onEditIntake={reopenIntake}
        onOpenGlossary={() => { pushEvent("gmc_glossary_open", {}); setGlossaryOpen(true); }}
      />

      {isDesktop && (
        <InsurerPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          insurers={data.insurers}
          selected={selected}
          onToggle={toggleInsurer}
          productType={productType}
          onProductType={setProductType}
        />
      )}

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

      {!isDesktop && (
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
        notableCount={notableCount}
        hidden={!!openFeature}
        compareOpen={pickerOpen}
        onCompareOpenChange={setPickerOpen}
      />
      )}

      {embed ? (
        <section
          className="py-6 border-t"
          style={{ borderColor: "var(--gmc-line)", background: "var(--gmc-bg-alt)" }}
          data-testid="embed-disclaimer"
        >
          <div className="gmc-container">
            <p className="gmc-t-sm leading-relaxed" style={{ color: "var(--gmc-body)" }}>
              Summaries for general information only, not financial advice. Always confirm
              against the insurer&apos;s current policy document. Insurer logos are used to
              identify the products compared. Get My Cover is independent and is not
              affiliated with or endorsed by any insurer.
            </p>
          </div>
        </section>
      ) : (
        <Disclaimer />
      )}

      <div
        className="xl:hidden print:hidden"
        style={{ height: "calc(env(safe-area-inset-bottom, 0px) + 104px)" }}
        aria-hidden="true"
      />

      <GlossaryPanel
        glossary={data.glossary}
        open={glossaryOpen}
        onOpenChange={setGlossaryOpen}
      />

      <DetailModal
        feature={currentFeature}
        insurers={selectedInsurers}
        lookup={lookup}
        glossary={data.glossary}
        explanation={explanation}
        onClose={() => setOpenFeature(null)}
      />
    </div>
  );
}
