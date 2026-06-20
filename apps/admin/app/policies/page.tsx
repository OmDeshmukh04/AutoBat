import { Panel, Pill } from "../components/ui";
import { getPolicies } from "../lib/api";

export default async function PoliciesPage() {
  const { data: policies } = await getPolicies();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Channel</p>
          <h2 className="page-title">Warranty policies</h2>
          <p className="page-sub">
            Versioned policies define the free-replacement split, total warranty
            term, and registration window per product.
          </p>
        </div>
        <button type="button" className="btn btn-primary">
          New policy version
        </button>
      </div>

      <Panel title="Policies">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Policy</th>
              <th className="num">Version</th>
              <th className="num">Free repl.</th>
              <th className="num">Total</th>
              <th className="num">Reg. window</th>
              <th>State</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.id}>
                <td>{policy.productName}</td>
                <td>{policy.policyName}</td>
                <td className="num">v{policy.version}</td>
                <td className="num">{policy.freeReplacementMonths} mo</td>
                <td className="num">{policy.totalWarrantyMonths} mo</td>
                <td className="num">{policy.registrationWindowDays} d</td>
                <td>
                  <Pill tone={policy.isDraft ? "warn" : "ok"}>
                    {policy.isDraft ? "Draft" : "Published"}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
