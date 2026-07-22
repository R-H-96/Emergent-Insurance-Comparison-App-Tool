import { ShieldCheck } from "lucide-react";

export default function TrustStrip() {
  return (
    <div className="gmc-trust-strip" data-testid="trust-strip">
      <ShieldCheck
        className="w-4 h-4"
        strokeWidth={2.2}
        style={{ color: "var(--gmc-teal-deep)" }}
      />
      <span>
        Free &amp; no obligation · Advisers are paid by the insurer, never by you
      </span>
    </div>
  );
}
