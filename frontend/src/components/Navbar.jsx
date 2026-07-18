import { Leaf } from "lucide-react";

export default function Navbar() {
  return (
    <nav
      className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-[#E5E5EA]/60"
      data-testid="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-2.5 group"
          data-testid="brand-link"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#34C759] flex items-center justify-center shadow-[0_4px_12px_rgba(52,199,89,0.35)] transition-transform group-hover:scale-105">
            <Leaf className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight text-[#1D1D1F]">
            Vireo
          </span>
          <span className="text-xs font-medium text-[#86868B] hidden sm:block">
            Insurance Compare
          </span>
        </a>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#424245]">
          <a href="#compare" className="hover:text-[#1D1D1F] transition-colors" data-testid="nav-compare">
            Compare
          </a>
          <a href="#how" className="hover:text-[#1D1D1F] transition-colors" data-testid="nav-how">
            How it works
          </a>
          <a href="#faq" className="hover:text-[#1D1D1F] transition-colors" data-testid="nav-faq">
            FAQ
          </a>
        </div>
        <div className="text-xs font-medium text-[#86868B] hidden sm:block">
          100% free · No signup
        </div>
      </div>
    </nav>
  );
}
