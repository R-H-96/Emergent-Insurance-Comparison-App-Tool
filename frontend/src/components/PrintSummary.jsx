import { groupLabel, intakeSummary } from "@/lib/personalisation";
import { coverState, gapFeatures, STATE_META, COVER_STATE } from "@/lib/gaps";
import { isNotableForSelection } from "@/lib/notable";

/**
* "Take this to your adviser", the printable artefact.
 *
 * Hidden on screen, rendered on print. The tool's job ends at describing
 * differences; the adviser conversation is where those differences get turned
 * into a decision, so the most useful thing we can hand someone is a page they
* can put on the table in that conversation. Every value, every cover gap, and
 * every citation, on paper.
 *
 * Deliberately plain: no colour fills, no chrome, nothing that costs ink or
 * survives poorly in greyscale.
 */
export default function PrintSummary({ features, insurers, lookup, intake }) {
  if (!insurers.length) return null;

  const notable = features.filter((f) => isNotableForSelection(f, insurers, lookup));
  const gaps = gapFeatures(features, insurers, lookup);
  const gapNames = new Set(gaps.map((g) => g.feature.feature));
  const seen = new Set();
  const rows = [];
  [...notable, ...gaps.map((g) => g.feature)].forEach((f) => {
    if (seen.has(f.feature)) return;
    seen.add(f.feature);
    rows.push(f);
  });

  const bits = intakeSummary(intake);
  const today = new Date().toLocaleDateString("en-NZ", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="hidden print:block" data-testid="print-summary">
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
        Health insurance comparison
      </h1>
      <p style={{ fontSize: 12, margin: "4px 0 0" }}>
        {insurers.map((i) => i.name).join(" vs ")} · prepared {today} · getmycover.co.nz
      </p>
      {bits.length > 0 && (
        <p style={{ fontSize: 12, margin: "2px 0 0" }}>
          Prepared for: {bits.map((b) => b.label).join(" · ")}
        </p>
      )}

      <h2 style={{ fontSize: 14, fontWeight: 700, margin: "16px 0 6px" }}>
        Policies compared
      </h2>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <tbody>
          {insurers.map((ins) => (
            <tr key={ins.id} style={{ borderBottom: "1px solid #ccc" }}>
              <td style={{ padding: "4px 8px 4px 0", fontWeight: 700, whiteSpace: "nowrap" }}>
                {ins.name}
              </td>
              <td style={{ padding: "4px 8px 4px 0" }}>{ins.product}</td>
              <td style={{ padding: "4px 0" }}>{ins.version}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: 14, fontWeight: 700, margin: "16px 0 6px" }}>
        Where these policies differ ({rows.length})
      </h2>
      {rows.map((f) => (
        <div
          key={f.feature}
          style={{ breakInside: "avoid", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid #eee" }}
        >
          <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {groupLabel(f.group)}
            {gapNames.has(f.feature) ? " · cover gap" : ""}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{f.feature}</div>
          {f.definition && (
            <div style={{ fontSize: 10.5, margin: "1px 0 4px" }}>
              {f.definition.replace(/[{}]/g, "")}
            </div>
          )}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <tbody>
              {insurers.map((ins) => {
                const entry = lookup[ins.id]?.[f.feature];
                const st = coverState(entry);
                return (
                  <tr key={ins.id}>
                    <td style={{ padding: "2px 8px 2px 0", fontWeight: 700, whiteSpace: "nowrap", verticalAlign: "top" }}>
                      {ins.name}
                    </td>
                    <td style={{ padding: "2px 8px 2px 0", whiteSpace: "nowrap", verticalAlign: "top" }}>
                      {st !== COVER_STATE.COVERED ? `[${STATE_META[st].label}]` : ""}
                    </td>
                    <td style={{ padding: "2px 0", verticalAlign: "top" }}>
{(entry?.short || "Not recorded").replace(/[{}]/g, "")}
                      {entry?.source && (
                        <div style={{ fontSize: 9 }}>Source: {entry.source}</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ))}

      <h2 style={{ fontSize: 14, fontWeight: 700, margin: "16px 0 6px" }}>
        Source documents
      </h2>
      <ul style={{ fontSize: 10.5, paddingLeft: 16, margin: 0 }}>
        {insurers.map((ins) =>
          (ins.sources || []).map((s, i) => (
            <li key={`${ins.id}-${i}`} style={{ marginBottom: 2 }}>
{ins.name}, {s.label}: {s.url}
            </li>
          )),
        )}
      </ul>

      <h2 style={{ fontSize: 14, fontWeight: 700, margin: "16px 0 6px" }}>
        Questions worth asking an adviser
      </h2>
      <ul style={{ fontSize: 11, paddingLeft: 16, margin: 0 }}>
        <li>Which of these differences actually applies to my situation?</li>
        <li>What would each policy cost me, and how do excess choices change that?</li>
        <li>What happens to anything I&apos;ve already been treated for?</li>
        {intake?.switching && (
<li>What do I lose from my current policy if I move, waiting periods, loyalty benefits?</li>
        )}
      </ul>

      <p style={{ fontSize: 9.5, marginTop: 16, lineHeight: 1.5 }}>
        Summaries for general information only, not financial advice. Values marked
&ldquo;Not confirmed&rdquo; have not been located in the policy wording, that does not
        mean they are excluded. Always confirm against the insurer&apos;s current policy
        document. Get My Cover is independent and is not affiliated with or endorsed by any
        insurer. Insurer names are used to identify the products compared.
      </p>
    </div>
  );
}
