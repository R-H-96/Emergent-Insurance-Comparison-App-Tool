export default function Disclaimer() {
  return (
    <footer
      className="border-t"
      style={{
        borderColor: "var(--gmc-line)",
        background: "var(--gmc-bg-alt)",
      }}
      data-testid="standing-disclaimer"
    >
      <div className="gmc-container py-8 sm:py-10">
        <div className="gmc-eyebrow mb-3">Important</div>
        <p
          className="text-sm max-w-4xl"
          style={{ color: "var(--gmc-body)" }}
        >
          Summaries for general information only, not financial advice. Always
          confirm against the insurer&apos;s current policy document (linked
          above). This tool describes differences between products; a licensed
          financial adviser gives advice.
        </p>
        <p
          className="mt-6 text-xs"
          style={{ color: "var(--gmc-faint)" }}
        >
          © {new Date().getFullYear()} Get My Cover · NZ
        </p>
      </div>
    </footer>
  );
}
