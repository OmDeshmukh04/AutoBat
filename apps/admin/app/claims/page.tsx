import { Panel, Pill } from "../components/ui";
import { getClaims } from "../lib/api";

const STAGE_TONE: Record<string, "ok" | "warn" | "bad" | "muted"> = {
  Submitted: "muted",
  "Under review": "warn",
  "Field test": "warn",
  Approved: "ok",
  Replaced: "ok",
  Rejected: "bad"
};

export default async function ClaimsPage() {
  const { data: claims } = await getClaims();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Claims & service</p>
          <h2 className="page-title">Claims workbench</h2>
          <p className="page-sub">
            Review, test, and decide on warranty claims raised by the channel.
          </p>
        </div>
        <div className="page-head-actions">
          <button type="button" className="btn btn-ghost">
            Filter
          </button>
          <button type="button" className="btn btn-primary">
            Bulk decision
          </button>
        </div>
      </div>

      <Panel title="Open claims">
        <table className="table">
          <thead>
            <tr>
              <th>Claim</th>
              <th>Serial</th>
              <th>Customer</th>
              <th>Partner</th>
              <th>Reason</th>
              <th>Stage</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className={claim.overSla ? "row-flag" : undefined}>
                <td className="mono">{claim.id}</td>
                <td className="mono">{claim.serialNumber}</td>
                <td>{claim.customer}</td>
                <td>{claim.partner}</td>
                <td>{claim.reason}</td>
                <td>
                  <Pill tone={STAGE_TONE[claim.stage] ?? "muted"}>
                    {claim.stage}
                  </Pill>
                </td>
                <td>
                  {claim.age}
                  {claim.overSla ? <span className="sla-flag"> · SLA</span> : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
