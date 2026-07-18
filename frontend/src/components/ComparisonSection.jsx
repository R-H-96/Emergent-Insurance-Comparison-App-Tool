import { useState, useMemo } from "react";
import { Filter, Star, ArrowUpDown, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProviderCard from "@/components/ProviderCard";
import ProviderModal from "@/components/ProviderModal";
import SideBySide from "@/components/SideBySide";
import { toast } from "sonner";

const currency = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export default function ComparisonSection({
  category,
  quotes,
  loading,
  hasQuoted,
  quoteInputs,
}) {
  const [sortBy, setSortBy] = useState("premium_asc");
  const [maxPremium, setMaxPremium] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  const [selected, setSelected] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [showSideBySide, setShowSideBySide] = useState(false);

  const filtered = useMemo(() => {
    let list = [...quotes];
    list = list.filter(
      (q) => q.monthly_premium <= maxPremium && q.rating >= minRating,
    );
    switch (sortBy) {
      case "premium_asc":
        list.sort((a, b) => a.monthly_premium - b.monthly_premium);
        break;
      case "premium_desc":
        list.sort((a, b) => b.monthly_premium - a.monthly_premium);
        break;
      case "rating_desc":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "deductible_asc":
        list.sort((a, b) => a.deductible - b.deductible);
        break;
      default:
        break;
    }
    return list;
  }, [quotes, sortBy, maxPremium, minRating]);

  const maxPremiumBound = useMemo(() => {
    if (!quotes.length) return 1000;
    return Math.ceil(Math.max(...quotes.map((q) => q.monthly_premium)) / 50) * 50 + 50;
  }, [quotes]);

  // Adjust maxPremium slider on category change
  useMemo(() => {
    setMaxPremium(maxPremiumBound);
  }, [maxPremiumBound]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) {
        toast.warning("You can compare up to 4 plans at once");
        return prev;
      }
      return [...prev, id];
    });
  };

  const selectedQuotes = quotes.filter((q) => selected.includes(q.id));

  return (
    <section
      id="comparison-section"
      className="relative py-16 sm:py-24 bg-white border-t border-[#E5E5EA]"
      data-testid="comparison-section"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="text-xs font-semibold tracking-widest uppercase text-[#34C759] mb-2">
              {category === "health" ? "Health plans" : "Life plans"}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-[#1D1D1F]">
              {hasQuoted ? "Your personalized quotes" : "Popular plans right now"}
            </h2>
            <p className="text-[#424245] mt-2 text-sm sm:text-base">
              {hasQuoted
                ? `Priced for ${quoteInputs.age}-year-old${quoteInputs.smoker ? ", smoker" : ""}, ${currency(quoteInputs.coverage_amount)} coverage.`
                : "Baseline pricing shown. Enter your details above for personalized quotes."}
            </p>
          </div>

          {selected.length >= 2 && (
            <Button
              onClick={() => setShowSideBySide(true)}
              className="rounded-full bg-[#1D1D1F] hover:bg-black text-white h-11 px-6 font-medium shadow-lg"
              data-testid="compare-selected-btn"
            >
              Compare {selected.length} selected
            </Button>
          )}
        </div>

        {/* Filters bar */}
        <div
          className="bg-[#FBFBFD] border border-[#E5E5EA] rounded-2xl p-5 sm:p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          data-testid="filters-bar"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-3">
              <Filter className="w-3.5 h-3.5" strokeWidth={2} />
              Max monthly premium
            </div>
            <div className="flex items-center gap-4">
              <Slider
                data-testid="max-premium-slider"
                min={50}
                max={maxPremiumBound}
                step={10}
                value={[maxPremium]}
                onValueChange={(v) => setMaxPremium(v[0])}
                className="flex-1"
              />
              <span className="text-sm font-semibold text-[#1D1D1F] min-w-[70px] text-right">
                {currency(maxPremium)}
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-3">
              <Star className="w-3.5 h-3.5" strokeWidth={2} />
              Minimum rating
            </div>
            <div className="flex items-center gap-4">
              <Slider
                data-testid="min-rating-slider"
                min={0}
                max={5}
                step={0.1}
                value={[minRating]}
                onValueChange={(v) => setMinRating(v[0])}
                className="flex-1"
              />
              <span className="text-sm font-semibold text-[#1D1D1F] min-w-[50px] text-right">
                {minRating.toFixed(1)}★
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#86868B] uppercase tracking-wider mb-3">
              <ArrowUpDown className="w-3.5 h-3.5" strokeWidth={2} />
              Sort by
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger
                className="h-10 rounded-xl bg-white border-[#E5E5EA]"
                data-testid="sort-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E5E5EA] rounded-xl">
                <SelectItem value="premium_asc" data-testid="sort-premium-asc">
                  Lowest premium
                </SelectItem>
                <SelectItem value="premium_desc">Highest premium</SelectItem>
                <SelectItem value="rating_desc">Best rated</SelectItem>
                <SelectItem value="deductible_asc">Lowest deductible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-3xl bg-[#F5F5F7] animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-20 border-2 border-dashed border-[#E5E5EA] rounded-3xl"
            data-testid="empty-state"
          >
            <div className="text-[#86868B] text-sm">
              No plans match your filters. Try relaxing them.
            </div>
          </div>
        ) : (
          <div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            data-testid="providers-grid"
          >
            {filtered.map((q, i) => (
              <ProviderCard
                key={q.id}
                quote={q}
                category={category}
                selected={selected.includes(q.id)}
                onToggleSelect={() => toggleSelect(q.id)}
                onOpenDetails={() => setActiveModal(q)}
                animationDelay={`${i * 60}ms`}
              />
            ))}
          </div>
        )}

        {/* Sticky compare bar */}
        {selected.length > 0 && !showSideBySide && (
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#1D1D1F] text-white rounded-full pl-5 pr-2 py-2 flex items-center gap-4 shadow-2xl"
            data-testid="sticky-compare-bar"
          >
            <span className="text-sm font-medium">
              {selected.length} plan{selected.length > 1 ? "s" : ""} selected
            </span>
            <Button
              onClick={() => setShowSideBySide(true)}
              disabled={selected.length < 2}
              className="rounded-full bg-[#34C759] hover:bg-[#28A745] text-white h-9 px-4 text-sm font-medium disabled:opacity-50"
              data-testid="sticky-compare-btn"
            >
              Compare side-by-side
            </Button>
            <button
              onClick={() => setSelected([])}
              className="text-white/70 hover:text-white transition p-1"
              data-testid="clear-selected"
              aria-label="Clear selected"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {activeModal && (
        <ProviderModal
          quote={activeModal}
          category={category}
          onClose={() => setActiveModal(null)}
        />
      )}
      {showSideBySide && (
        <SideBySide
          quotes={selectedQuotes}
          category={category}
          onClose={() => setShowSideBySide(false)}
        />
      )}
    </section>
  );
}
