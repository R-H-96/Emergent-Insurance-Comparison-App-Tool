import { X, Check, XCircle, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const currency = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export default function SideBySide({ quotes, category, onClose }) {
  if (!quotes.length) return null;

  const rows =
    category === "health"
      ? [
          { label: "Monthly premium", key: (q) => currency(q.monthly_premium), highlight: true },
          { label: "Annual premium", key: (q) => currency(q.annual_premium) },
          { label: "Deductible", key: (q) => currency(q.deductible) },
          {
            label: "Max out-of-pocket",
            key: (q) => (q.max_out_of_pocket ? currency(q.max_out_of_pocket) : "—"),
          },
          { label: "Network", key: (q) => q.network_size || "—" },
          { label: "Rating", key: (q) => `${q.rating.toFixed(1)}★ (${q.reviews.toLocaleString()})` },
        ]
      : [
          { label: "Monthly premium", key: (q) => currency(q.monthly_premium), highlight: true },
          { label: "Annual premium", key: (q) => currency(q.annual_premium) },
          { label: "Coverage", key: (q) => currency(q.coverage_amount) },
          { label: "Term", key: (q) => (q.term_years ? `${q.term_years} yrs` : "—") },
          { label: "Payout speed", key: (q) => q.payout_speed || "—" },
          { label: "Rating", key: (q) => `${q.rating.toFixed(1)}★ (${q.reviews.toLocaleString()})` },
        ];

  const cheapest = Math.min(...quotes.map((q) => q.monthly_premium));

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-w-6xl max-h-[92vh] overflow-hidden bg-white rounded-3xl border-[#E5E5EA] p-0 gap-0 flex flex-col"
        data-testid="side-by-side-modal"
      >
        <DialogHeader className="p-6 sm:p-8 pb-4 border-b border-[#F2F2F7]">
          <DialogTitle className="font-display text-2xl font-semibold tracking-tight text-[#1D1D1F] text-left">
            Side-by-side comparison
          </DialogTitle>
          <p className="text-sm text-[#86868B] mt-1 text-left">
            {quotes.length} plans · Best price highlighted in green
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-auto thin-scrollbar">
          <div className="min-w-[720px]">
            {/* Provider header row */}
            <div
              className="grid sticky top-0 z-10 bg-white border-b border-[#E5E5EA]"
              style={{
                gridTemplateColumns: `220px repeat(${quotes.length}, minmax(160px, 1fr))`,
              }}
            >
              <div className="p-5 bg-[#FBFBFD] font-semibold text-xs uppercase tracking-widest text-[#86868B] sticky-shadow">
                Provider
              </div>
              {quotes.map((q) => (
                <div key={q.id} className="p-5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-white text-sm"
                      style={{ backgroundColor: q.accent_color }}
                    >
                      {q.logo}
                    </div>
                    <div>
                      <div className="font-display font-semibold text-[#1D1D1F] text-sm leading-tight">
                        {q.name}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />
                        <span className="text-xs text-[#86868B]">
                          {q.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rows */}
            {rows.map((row, ri) => (
              <div
                key={row.label}
                className={`grid border-b border-[#F2F2F7] ${
                  ri % 2 === 0 ? "bg-white" : "bg-[#FBFBFD]"
                }`}
                style={{
                  gridTemplateColumns: `220px repeat(${quotes.length}, minmax(160px, 1fr))`,
                }}
              >
                <div className="p-4 text-sm font-medium text-[#424245] bg-inherit sticky left-0 sticky-shadow">
                  {row.label}
                </div>
                {quotes.map((q) => {
                  const isCheapest =
                    row.highlight && q.monthly_premium === cheapest;
                  return (
                    <div
                      key={q.id}
                      className={`p-4 text-sm ${
                        isCheapest
                          ? "font-semibold text-[#00A86B]"
                          : "text-[#1D1D1F]"
                      }`}
                    >
                      {row.key(q)}
                      {isCheapest && (
                        <span className="ml-1.5 text-[10px] uppercase tracking-wider bg-[#E8F5E9] text-[#00A86B] px-1.5 py-0.5 rounded-full font-semibold">
                          Best
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Features row */}
            <div
              className="grid border-b border-[#F2F2F7]"
              style={{
                gridTemplateColumns: `220px repeat(${quotes.length}, minmax(160px, 1fr))`,
              }}
            >
              <div className="p-4 text-sm font-medium text-[#424245] sticky left-0 bg-white sticky-shadow">
                Key features
              </div>
              {quotes.map((q) => (
                <div key={q.id} className="p-4">
                  <ul className="space-y-1.5">
                    {q.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-1.5 text-xs text-[#424245]"
                      >
                        <Check
                          className="w-3 h-3 text-[#00A86B] mt-0.5 flex-shrink-0"
                          strokeWidth={2.5}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Exclusions row */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: `220px repeat(${quotes.length}, minmax(160px, 1fr))`,
              }}
            >
              <div className="p-4 text-sm font-medium text-[#424245] sticky left-0 bg-white sticky-shadow">
                Not covered
              </div>
              {quotes.map((q) => (
                <div key={q.id} className="p-4">
                  <ul className="space-y-1.5">
                    {q.exclusions.map((e) => (
                      <li
                        key={e}
                        className="flex items-start gap-1.5 text-xs text-[#86868B]"
                      >
                        <XCircle
                          className="w-3 h-3 mt-0.5 flex-shrink-0"
                          strokeWidth={2}
                        />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
