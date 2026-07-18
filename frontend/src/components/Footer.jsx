import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="bg-[#FBFBFD] border-t border-[#E5E5EA] py-16"
      id="faq"
      data-testid="site-footer"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#34C759] flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" strokeWidth={2.2} />
              </div>
              <span className="font-display font-semibold text-[#1D1D1F]">
                Vireo
              </span>
            </div>
            <p className="text-sm text-[#424245] leading-relaxed">
              An independent tool to compare insurance quotes. Not affiliated
              with any provider. All pricing shown is estimated for illustration.
            </p>
          </div>

          <div id="how">
            <h4 className="text-sm font-semibold text-[#1D1D1F] mb-4">
              How it works
            </h4>
            <ol className="space-y-3 text-sm text-[#424245]">
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#00A86B] text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                Choose health or life insurance
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#00A86B] text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                Enter age, coverage, and lifestyle details
              </li>
              <li className="flex gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#E8F5E9] text-[#00A86B] text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                Compare quotes side-by-side, transparently
              </li>
            </ol>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#1D1D1F] mb-4">
              Common questions
            </h4>
            <ul className="space-y-3 text-sm text-[#424245]">
              <li>
                <strong className="text-[#1D1D1F]">Is this free?</strong>{" "}
                Yes — no signup, no fees, no spam.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">
                  Are quotes real?
                </strong>{" "}
                Pricing is illustrative for demo purposes.
              </li>
              <li>
                <strong className="text-[#1D1D1F]">Do you sell my data?</strong>{" "}
                Never. We don&apos;t collect personal info.
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#E5E5EA] text-xs text-[#86868B] flex flex-col sm:flex-row justify-between gap-2">
          <div>© {new Date().getFullYear()} Vireo. For demonstration only.</div>
          <div>Made with care · Not financial advice</div>
        </div>
      </div>
    </footer>
  );
}
