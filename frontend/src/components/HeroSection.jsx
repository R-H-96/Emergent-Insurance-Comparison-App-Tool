import { Heart, Shield, Sparkles, ArrowRight } from "lucide-react";
import QuoteForm from "@/components/QuoteForm";
import { Button } from "@/components/ui/button";

export default function HeroSection({
  category,
  setCategory,
  quoteInputs,
  setQuoteInputs,
  onGetQuote,
  loading,
}) {
  return (
    <section
      className="relative overflow-hidden pt-14 pb-24 sm:pt-20 sm:pb-32"
      id="compare"
      data-testid="hero-section"
    >
      {/* Ambient gradient blobs */}
      <div
        aria-hidden
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#E8F5E9] blur-3xl opacity-70 pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#34C759]/10 blur-3xl opacity-60 pointer-events-none"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: copy + toggle */}
          <div className="fade-in-up">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E5E5EA] shadow-sm text-xs font-medium text-[#00A86B] mb-6"
              data-testid="hero-badge"
            >
              <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
              Real quotes, side by side, in 30 seconds.
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-[#1D1D1F] leading-[1.05]">
              Insurance that
              <br />
              <span className="text-[#34C759]">actually makes sense.</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#424245] leading-relaxed max-w-lg">
              Compare {category === "health" ? "health" : "life"} insurance
              plans from top-rated providers. Real numbers, honest tradeoffs,
              zero jargon. Pick what fits your life.
            </p>

            {/* Category switch */}
            <div
              className="mt-10 inline-flex p-1.5 rounded-full bg-white border border-[#E5E5EA] shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
              data-testid="category-switch"
            >
              <button
                onClick={() => setCategory("health")}
                data-testid="category-switch-health"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  category === "health"
                    ? "bg-[#34C759] text-white shadow-[0_4px_14px_rgba(52,199,89,0.35)]"
                    : "text-[#424245] hover:text-[#1D1D1F]"
                }`}
              >
                <Heart
                  className="w-4 h-4"
                  strokeWidth={2}
                  fill={category === "health" ? "currentColor" : "none"}
                />
                Health
              </button>
              <button
                onClick={() => setCategory("life")}
                data-testid="category-switch-life"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  category === "life"
                    ? "bg-[#34C759] text-white shadow-[0_4px_14px_rgba(52,199,89,0.35)]"
                    : "text-[#424245] hover:text-[#1D1D1F]"
                }`}
              >
                <Shield
                  className="w-4 h-4"
                  strokeWidth={2}
                  fill={category === "life" ? "currentColor" : "none"}
                />
                Life
              </button>
            </div>

            {/* Trust row */}
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <TrustStat value="6+" label="Top providers" />
              <TrustStat value="30s" label="To compare" />
              <TrustStat value="$0" label="Fee to use" />
            </div>

            <div className="mt-10">
              <Button
                onClick={() => {
                  document
                    .getElementById("quote-form-card")
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="lg:hidden rounded-full bg-[#1D1D1F] hover:bg-[#000] text-white px-6 h-12 font-medium"
                data-testid="hero-cta-mobile"
              >
                Get my quote
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Right: quote form card */}
          <div
            id="quote-form-card"
            className="fade-in-up"
            style={{ animationDelay: "0.15s" }}
          >
            <QuoteForm
              category={category}
              inputs={quoteInputs}
              setInputs={setQuoteInputs}
              onSubmit={onGetQuote}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustStat({ value, label }) {
  return (
    <div>
      <div className="font-display text-2xl font-semibold tracking-tight text-[#1D1D1F]">
        {value}
      </div>
      <div className="text-xs text-[#86868B] mt-0.5">{label}</div>
    </div>
  );
}
