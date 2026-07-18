import { X, Star, Check, XCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const currency = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export default function ProviderModal({ quote, category, onClose }) {
  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border-[#E5E5EA] p-0 gap-0"
        data-testid="provider-modal"
      >
        {/* Header */}
        <DialogHeader className="p-8 pb-6 border-b border-[#F2F2F7]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-white text-xl flex-shrink-0"
                style={{ backgroundColor: quote.accent_color }}
              >
                {quote.logo}
              </div>
              <div>
                <DialogTitle className="font-display text-2xl font-semibold tracking-tight text-[#1D1D1F] text-left">
                  {quote.name}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1.5">
                  <Star className="w-4 h-4 text-[#FFB800] fill-[#FFB800]" />
                  <span className="text-sm font-medium text-[#424245]">
                    {quote.rating.toFixed(1)}
                  </span>
                  <span className="text-sm text-[#86868B]">
                    · {quote.reviews.toLocaleString()} reviews
                  </span>
                </div>
                <p className="text-sm text-[#424245] mt-2">{quote.tagline}</p>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Bento grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <BentoStat
            label="Monthly premium"
            value={currency(quote.monthly_premium)}
            sub={`${currency(quote.annual_premium)}/yr`}
            featured
          />
          {category === "health" ? (
            <>
              <BentoStat label="Deductible" value={currency(quote.deductible)} />
              <BentoStat
                label="Max out-of-pocket"
                value={quote.max_out_of_pocket ? currency(quote.max_out_of_pocket) : "—"}
              />
              <BentoStat label="Network" value={quote.network_size || "—"} />
            </>
          ) : (
            <>
              <BentoStat
                label="Coverage amount"
                value={currency(quote.coverage_amount)}
              />
              <BentoStat
                label="Term length"
                value={quote.term_years ? `${quote.term_years} years` : "—"}
              />
              <BentoStat
                label="Payout speed"
                value={quote.payout_speed || "—"}
              />
            </>
          )}
        </div>

        {/* Benefits */}
        <div className="px-8 pb-8">
          <SectionTitle>What&apos;s covered</SectionTitle>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
            {quote.benefits.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2.5 text-sm text-[#424245]"
              >
                <div className="w-5 h-5 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-[#00A86B]" strokeWidth={3} />
                </div>
                {b}
              </li>
            ))}
          </ul>

          <SectionTitle className="mt-8">Not covered</SectionTitle>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
            {quote.exclusions.map((e) => (
              <li
                key={e}
                className="flex items-start gap-2.5 text-sm text-[#424245]"
              >
                <XCircle
                  className="w-4 h-4 text-[#86868B] flex-shrink-0 mt-0.5"
                  strokeWidth={2}
                />
                {e}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <ProsConsCard
              title="Pros"
              items={quote.pros}
              icon={ThumbsUp}
              tone="green"
            />
            <ProsConsCard
              title="Cons"
              items={quote.cons}
              icon={ThumbsDown}
              tone="grey"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BentoStat({ label, value, sub, featured }) {
  return (
    <div
      className={`rounded-2xl p-5 ${
        featured
          ? "bg-[#1D1D1F] text-white col-span-1 md:col-span-2"
          : "bg-[#F5F5F7] text-[#1D1D1F]"
      }`}
    >
      <div
        className={`text-xs uppercase tracking-wider font-medium ${
          featured ? "text-white/60" : "text-[#86868B]"
        }`}
      >
        {label}
      </div>
      <div
        className={`font-display font-semibold tracking-tight mt-1 ${
          featured ? "text-3xl" : "text-lg"
        }`}
      >
        {value}
      </div>
      {sub && (
        <div
          className={`text-xs mt-1 ${
            featured ? "text-white/60" : "text-[#86868B]"
          }`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children, className = "" }) {
  return (
    <h3
      className={`text-xs uppercase tracking-widest font-semibold text-[#86868B] ${className}`}
    >
      {children}
    </h3>
  );
}

function ProsConsCard({ title, items, icon: Icon, tone }) {
  const color =
    tone === "green"
      ? { bg: "#E8F5E9", text: "#00A86B" }
      : { bg: "#F5F5F7", text: "#86868B" };
  return (
    <div className="rounded-2xl border border-[#E5E5EA] p-5">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center"
          style={{ backgroundColor: color.bg }}
        >
          <Icon className="w-3.5 h-3.5" strokeWidth={2.5} color={color.text} />
        </div>
        <span className="text-sm font-semibold text-[#1D1D1F]">{title}</span>
      </div>
      <ul className="space-y-2">
        {items.map((i) => (
          <li key={i} className="text-sm text-[#424245] leading-relaxed">
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
