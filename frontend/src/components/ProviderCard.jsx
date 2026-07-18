import { Star, Check, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const currency = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export default function ProviderCard({
  quote,
  category,
  selected,
  onToggleSelect,
  onOpenDetails,
  animationDelay = "0ms",
}) {
  return (
    <div
      className={`group relative bg-white rounded-3xl border transition-all duration-300 overflow-hidden fade-in-up ${
        selected
          ? "border-[#34C759] shadow-[0_12px_40px_-12px_rgba(52,199,89,0.4)]"
          : "border-[#E5E5EA] hover:border-[#34C759]/50 hover:shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)]"
      }`}
      style={{ animationDelay }}
      data-testid={`provider-card-${quote.id}`}
    >
      {quote.badge && (
        <div
          className="absolute top-5 right-5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase"
          style={{
            backgroundColor: `${quote.accent_color}15`,
            color: quote.accent_color,
          }}
          data-testid={`provider-badge-${quote.id}`}
        >
          {quote.badge}
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-display font-bold text-white text-lg"
            style={{ backgroundColor: quote.accent_color }}
          >
            {quote.logo}
          </div>
          <div>
            <div className="font-display font-semibold text-[#1D1D1F] text-lg leading-tight">
              {quote.name}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Star className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800]" />
              <span className="text-xs font-medium text-[#424245]">
                {quote.rating.toFixed(1)}
              </span>
              <span className="text-xs text-[#86868B]">
                ({quote.reviews.toLocaleString()})
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-[#424245] mb-6 leading-relaxed min-h-[40px]">
          {quote.tagline}
        </p>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-semibold text-[#1D1D1F] tracking-tight">
              {currency(quote.monthly_premium)}
            </span>
            <span className="text-sm text-[#86868B]">/mo</span>
          </div>
          <div className="text-xs text-[#86868B] mt-1">
            {currency(quote.annual_premium)} annually
          </div>
        </div>

        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {category === "health" ? (
            <>
              <MiniStat label="Deductible" value={currency(quote.deductible)} />
              <MiniStat
                label="Max out-of-pocket"
                value={quote.max_out_of_pocket ? currency(quote.max_out_of_pocket) : "—"}
              />
            </>
          ) : (
            <>
              <MiniStat label="Coverage" value={currency(quote.coverage_amount)} />
              <MiniStat label="Term" value={quote.term_years ? `${quote.term_years} yrs` : "—"} />
            </>
          )}
        </div>

        {/* Top features */}
        <ul className="space-y-2 mb-6">
          {quote.features.slice(0, 3).map((f) => (
            <li
              key={f}
              className="flex items-start gap-2 text-sm text-[#424245]"
            >
              <div className="w-4 h-4 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check
                  className="w-2.5 h-2.5 text-[#00A86B]"
                  strokeWidth={3}
                />
              </div>
              {f}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-[#F2F2F7]">
          <Button
            onClick={onOpenDetails}
            variant="ghost"
            className="flex-1 rounded-full h-10 text-sm font-medium text-[#1D1D1F] hover:bg-[#F5F5F7]"
            data-testid={`view-details-${quote.id}`}
          >
            <Info className="w-4 h-4 mr-1.5" strokeWidth={2} />
            Details
          </Button>
          <Button
            onClick={onToggleSelect}
            className={`flex-1 rounded-full h-10 text-sm font-medium transition-all ${
              selected
                ? "bg-[#34C759] hover:bg-[#28A745] text-white"
                : "bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F]"
            }`}
            data-testid={`select-${quote.id}`}
          >
            {selected ? (
              <>
                <Check className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                Selected
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} />
                Compare
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-[#F5F5F7] px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-[#86868B] font-medium">
        {label}
      </div>
      <div className="text-sm font-semibold text-[#1D1D1F] mt-0.5">
        {value}
      </div>
    </div>
  );
}
