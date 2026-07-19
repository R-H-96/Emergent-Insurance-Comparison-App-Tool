import CTA from "@/components/CTA";

export default function GmcNav() {
  return (
    <nav
      className="gmc-nav sticky top-0 z-40"
      data-testid="gmc-nav"
    >
      <div className="gmc-container flex items-center justify-between h-16">
        <a
          href="/"
          className="flex items-center gap-2"
          data-testid="gmc-brand"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ background: "var(--gmc-grad-button)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            G
          </div>
          <span
            className="font-extrabold tracking-tight text-lg"
            style={{ color: "var(--gmc-ink)" }}
          >
            Get&nbsp;My&nbsp;Cover
          </span>
        </a>
        <div
          className="hidden md:flex items-center gap-8 text-sm font-semibold"
          style={{ color: "var(--gmc-body)" }}
        >
          <a href="#compare" className="hover:text-[color:var(--gmc-teal-mid)] transition" data-testid="nav-compare">
            Compare policies
          </a>
          <a href="#how" className="hover:text-[color:var(--gmc-teal-mid)] transition" data-testid="nav-how">
            How it works
          </a>
        </div>
        <div className="hidden sm:block">
          <CTA compact data-testid="nav-cta" />
        </div>
      </div>
    </nav>
  );
}
