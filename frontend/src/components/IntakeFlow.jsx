import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ArrowLeft, Check, User, Users, UsersRound,
  Ribbon, Scissors, Stethoscope, Home, Hourglass, Award,
} from "lucide-react";
import InsurerLogo from "@/components/InsurerLogo";
import CTA from "@/components/CTA";
import {
  HOUSEHOLD_OPTIONS, PRIORITY_OPTIONS, KNOWLEDGE_OPTIONS,
} from "@/lib/personalisation";
import { pushEvent } from "@/lib/analytics";

const HH_ICONS = { solo: User, couple: Users, family: UsersRound };
const PRI_ICONS = {
  ribbon: Ribbon, scissors: Scissors, stethoscope: Stethoscope,
  home: Home, hourglass: Hourglass, award: Award,
};

const STEPS = ["household", "priorities", "knowledge", "insurers"];
const MAX_PRIORITIES = 3;

/**
 * Guided intake — four short screens shown before the comparison surface.
 *
 * Answers only re-order and re-explain what's shown; nothing is ever hidden
 * permanently (the "Everything" level of the ladder always shows all 25
 * features). "Skip — just compare" is available on every screen.
 *
 * No contact details are collected here. Lead capture happens only via the
 * adviser CTA, which the parent site's modal binds to.
 */
export default function IntakeFlow({
  insurers,
  selected,
  onToggleInsurer,
  onComplete,
  onSkip,
}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [household, setHousehold] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [knowledge, setKnowledge] = useState(null);

  const key = STEPS[step];

  // Fired on every screen view so drop-off can be read per step, not just
  // "finished" vs "skipped".
  useEffect(() => {
    pushEvent("gmc_intake_step", { step: key, index: step + 1, of: STEPS.length });
  }, [key, step]);
  const pct = ((step + 1) / STEPS.length) * 100;

  const canContinue =
    (key === "household" && !!household) ||
    (key === "priorities" && priorities.length > 0) ||
    (key === "knowledge" && !!knowledge) ||
    (key === "insurers" && selected.length >= 2);

  const togglePriority = (id) =>
    setPriorities((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_PRIORITIES
          ? prev
          : [...prev, id],
    );

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    const opt = KNOWLEDGE_OPTIONS.find((k) => k.id === knowledge);
    const switching = !!opt?.switching;
    pushEvent("gmc_intake_complete", { household, priorities, knowledge, switching });
    onComplete({ household, priorities, knowledge, switching, completed: true, skipped: false });
  };

  const back = () => setStep((s) => Math.max(0, s - 1));

  const skip = () => {
    pushEvent("gmc_intake_skip", { at_step: key });
    onSkip();
  };

  return (
    <section className="py-8 sm:py-14" data-testid="intake-flow">
      <div className="gmc-container" style={{ maxWidth: 760 }}>
        {/* Progress + skip */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.1em]"
            style={{ color: "var(--gmc-teal-mid)" }}
          >
            Step {step + 1} of {STEPS.length}
          </span>
          <button
            type="button"
            onClick={skip}
            className="text-[13px] font-semibold underline decoration-dotted underline-offset-2 hover:decoration-solid"
            style={{ color: "var(--gmc-muted)" }}
            data-testid="intake-skip"
          >
            Skip — just compare
          </button>
        </div>
        <div
          className="h-1.5 rounded-full overflow-hidden mb-8 sm:mb-12"
          style={{ background: "var(--gmc-bg-soft)" }}
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "var(--gmc-grad-button)" }}
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={key}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: reduce ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {key === "household" && (
              <Screen
                title="Who's this cover for?"
                sub="Just so we show you the right kind of detail — there are no wrong answers."
              >
                <div className="space-y-3">
                  {HOUSEHOLD_OPTIONS.map((o) => {
                    const Icon = HH_ICONS[o.id];
                    return (
                      <OptionRow
                        key={o.id}
                        selected={household === o.id}
                        onClick={() => setHousehold(o.id)}
                        icon={Icon}
                        label={o.label}
                        blurb={o.blurb}
                        testId={`intake-household-${o.id}`}
                      />
                    );
                  })}
                </div>
              </Screen>
            )}

            {key === "priorities" && (
              <Screen
                title="What matters most to you?"
                sub={`Pick up to ${MAX_PRIORITIES}. We'll put those first — you can still see everything else.`}
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  {PRIORITY_OPTIONS.map((o) => {
                    const Icon = PRI_ICONS[o.icon];
                    const isSel = priorities.includes(o.id);
                    const full = !isSel && priorities.length >= MAX_PRIORITIES;
                    return (
                      <OptionRow
                        key={o.id}
                        selected={isSel}
                        disabled={full}
                        onClick={() => togglePriority(o.id)}
                        icon={Icon}
                        label={o.label}
                        blurb={o.blurb}
                        testId={`intake-priority-${o.id}`}
                      />
                    );
                  })}
                </div>
                <p className="mt-3 text-[12px]" style={{ color: "var(--gmc-muted)" }}>
                  {priorities.length} of {MAX_PRIORITIES} chosen
                </p>
              </Screen>
            )}

            {key === "knowledge" && (
              <Screen
                title="Where are you at with health insurance?"
                sub="This sets how much we explain as we go. You can change it any time."
              >
                <div className="space-y-3">
                  {KNOWLEDGE_OPTIONS.map((o) => (
                    <OptionRow
                      key={o.id}
                      selected={knowledge === o.id}
                      onClick={() => setKnowledge(o.id)}
                      label={o.label}
                      blurb={o.blurb}
                      testId={`intake-knowledge-${o.id}`}
                    />
                  ))}
                </div>
              </Screen>
            )}

            {key === "insurers" && (
              <Screen
                title="Which insurers should we compare?"
                sub="Pick two or three. We'll line them up side by side."
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  {insurers.map((ins) => {
                    const isSel = selected.includes(ins.id);
                    const full = !isSel && selected.length >= 3;
                    const accent = ins.accent || "var(--gmc-teal)";
                    return (
                      <button
                        key={ins.id}
                        type="button"
                        onClick={() => onToggleInsurer(ins.id)}
                        aria-pressed={isSel}
                        disabled={full}
                        className={`gmc-tap text-left flex items-center gap-3 p-4 rounded-[var(--gmc-r-ctl)] border-[1.5px] transition-all ${
                          full ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        }`}
                        style={{
                          borderColor: isSel ? accent : "var(--gmc-line-soft)",
                          background: isSel ? "var(--gmc-teal-tint-2)" : "white",
                          boxShadow: isSel ? `0 0 0 2px ${accent}` : "none",
                        }}
                        data-testid={`intake-insurer-${ins.id}`}
                      >
                        <InsurerLogo insurer={ins} size={30} />
                        <span className="min-w-0 flex-1">
                          <span
                            className="block font-extrabold text-[15px] leading-tight"
                            style={{ color: isSel ? accent : "var(--gmc-ink)" }}
                          >
                            {ins.name}
                          </span>
                          <span
                            className="block text-[12px] font-semibold mt-0.5"
                            style={{ color: "var(--gmc-muted)" }}
                          >
                            {ins.product}
                          </span>
                        </span>
                        {isSel && (
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: accent }}
                          >
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-[12px]" style={{ color: "var(--gmc-muted)" }}>
                  {selected.length} of 3 selected · Get My Cover is independent and is not
                  affiliated with or endorsed by any insurer.
                </p>
              </Screen>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between gap-4">
          {step > 0 ? (
            <button
              type="button"
              onClick={back}
              className="gmc-tap inline-flex items-center gap-2 text-[14px] font-bold"
              style={{ color: "var(--gmc-body)" }}
              data-testid="intake-back"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              Back
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={next}
            disabled={!canContinue}
            className="gmc-btn-primary gmc-tap"
            style={{ opacity: canContinue ? 1 : 0.45, cursor: canContinue ? "pointer" : "not-allowed" }}
            data-testid="intake-continue"
          >
            {step === STEPS.length - 1 ? "Compare now" : "Continue"}
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        <div
          className="mt-8 pt-6 text-center"
          style={{ borderTop: "1px solid var(--gmc-line)" }}
        >
          <p className="text-[13px] mb-3" style={{ color: "var(--gmc-body)" }}>
            Rather have someone walk you through it?
          </p>
          <CTA compact label="Talk to an FMA-licensed adviser — free" data-testid="intake-cta" />
        </div>
      </div>
    </section>
  );
}

function Screen({ title, sub, children }) {
  return (
    <div>
      <h2 className="gmc-h2 text-2xl sm:text-4xl mb-2">{title}</h2>
      <p className="text-[15px] mb-6 sm:mb-8" style={{ color: "var(--gmc-body)" }}>
        {sub}
      </p>
      {children}
    </div>
  );
}

function OptionRow({ selected, disabled, onClick, icon: Icon, label, blurb, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      disabled={disabled}
      className={`gmc-tap w-full text-left flex items-center gap-3.5 p-4 rounded-[var(--gmc-r-ctl)] border-[1.5px] transition-all ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:-translate-y-0.5"
      }`}
      style={{
        borderColor: selected ? "var(--gmc-teal)" : "var(--gmc-line-soft)",
        background: selected ? "var(--gmc-teal-tint-2)" : "white",
        boxShadow: selected ? "0 0 0 2px var(--gmc-teal)" : "none",
      }}
      data-testid={testId}
    >
      {Icon && (
        <span
          className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{
            background: selected ? "var(--gmc-teal)" : "var(--gmc-teal-tint)",
            color: selected ? "white" : "var(--gmc-teal-deep)",
          }}
        >
          <Icon className="w-5 h-5" strokeWidth={2.2} aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span
          className="flex items-center gap-1.5 font-extrabold text-[15px] leading-tight"
          style={{ color: "var(--gmc-ink)" }}
        >
          {label}
          {selected && (
            <Check
              className="w-4 h-4 flex-shrink-0"
              strokeWidth={3}
              style={{ color: "var(--gmc-teal)" }}
            />
          )}
        </span>
        <span className="block text-[13px] mt-0.5" style={{ color: "var(--gmc-body)" }}>
          {blurb}
        </span>
      </span>
    </button>
  );
}
