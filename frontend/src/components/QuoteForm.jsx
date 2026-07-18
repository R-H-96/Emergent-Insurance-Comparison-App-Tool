import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Loader2 } from "lucide-react";

const currency = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export default function QuoteForm({
  category,
  inputs,
  setInputs,
  onSubmit,
  loading,
}) {
  const update = (k, v) => setInputs((prev) => ({ ...prev, [k]: v }));

  const coverageMin = category === "life" ? 100000 : 50000;
  const coverageMax = category === "life" ? 2000000 : 500000;
  const coverageStep = category === "life" ? 50000 : 25000;

  return (
    <div
      className="relative bg-white rounded-3xl border border-[#E5E5EA] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] p-7 sm:p-8"
      data-testid="quote-form-card"
    >
      <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#00A86B] text-xs font-semibold tracking-wide">
        FREE QUOTE
      </div>

      <h3 className="font-display text-2xl font-semibold text-[#1D1D1F] tracking-tight">
        Tell us about you
      </h3>
      <p className="text-sm text-[#86868B] mt-1">
        We&apos;ll instantly recalculate pricing across all providers.
      </p>

      <div className="mt-7 space-y-6">
        {/* Age */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-[#1D1D1F]">Age</Label>
            <span
              className="text-sm font-semibold text-[#34C759]"
              data-testid="age-value"
            >
              {inputs.age} years
            </span>
          </div>
          <Slider
            data-testid="age-slider"
            min={18}
            max={75}
            step={1}
            value={[inputs.age]}
            onValueChange={(v) => update("age", v[0])}
            className="my-3"
          />
        </div>

        {/* Coverage amount */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-sm font-medium text-[#1D1D1F]">
              Coverage amount
            </Label>
            <span
              className="text-sm font-semibold text-[#34C759]"
              data-testid="coverage-value"
            >
              {currency(inputs.coverage_amount)}
            </span>
          </div>
          <Slider
            data-testid="coverage-slider"
            min={coverageMin}
            max={coverageMax}
            step={coverageStep}
            value={[inputs.coverage_amount]}
            onValueChange={(v) => update("coverage_amount", v[0])}
            className="my-3"
          />
          <div className="flex justify-between text-xs text-[#86868B]">
            <span>{currency(coverageMin)}</span>
            <span>{currency(coverageMax)}</span>
          </div>
        </div>

        {/* Category-specific */}
        {category === "health" ? (
          <div>
            <Label className="text-sm font-medium text-[#1D1D1F]">
              Family size
            </Label>
            <Select
              value={String(inputs.family_size)}
              onValueChange={(v) => update("family_size", Number(v))}
            >
              <SelectTrigger
                className="mt-2 h-11 rounded-xl bg-[#F5F5F7] border-transparent focus:bg-white focus:border-[#34C759] focus:ring-2 focus:ring-[#34C759]/20"
                data-testid="family-size-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E5E5EA] rounded-xl">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <SelectItem key={n} value={String(n)} data-testid={`family-size-${n}`}>
                    {n === 1 ? "Just me" : `${n} people`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <Label className="text-sm font-medium text-[#1D1D1F]">
              Term length
            </Label>
            <Select
              value={String(inputs.term_years)}
              onValueChange={(v) => update("term_years", Number(v))}
            >
              <SelectTrigger
                className="mt-2 h-11 rounded-xl bg-[#F5F5F7] border-transparent focus:bg-white focus:border-[#34C759] focus:ring-2 focus:ring-[#34C759]/20"
                data-testid="term-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border border-[#E5E5EA] rounded-xl">
                {[10, 15, 20, 25, 30].map((n) => (
                  <SelectItem key={n} value={String(n)} data-testid={`term-${n}`}>
                    {n} year term
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Smoker */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F5F5F7]">
          <div>
            <div className="text-sm font-medium text-[#1D1D1F]">
              Do you smoke or vape?
            </div>
            <div className="text-xs text-[#86868B] mt-0.5">
              Affects premium calculation
            </div>
          </div>
          <Switch
            data-testid="smoker-switch"
            checked={inputs.smoker}
            onCheckedChange={(v) => update("smoker", v)}
            className="data-[state=checked]:bg-[#34C759]"
          />
        </div>

        <Button
          onClick={onSubmit}
          disabled={loading}
          className="w-full h-13 py-3.5 rounded-full bg-[#34C759] hover:bg-[#28A745] text-white font-semibold text-base shadow-[0_8px_24px_-8px_rgba(52,199,89,0.6)] hover:shadow-[0_12px_28px_-8px_rgba(52,199,89,0.7)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          data-testid="get-quote-btn"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Calculating…
            </>
          ) : (
            <>
              Get my quotes <ArrowRight className="w-4 h-4 ml-1.5" />
            </>
          )}
        </Button>

        <p className="text-xs text-center text-[#86868B]">
          No credit card. No spam. Never shared.
        </p>
      </div>
    </div>
  );
}
