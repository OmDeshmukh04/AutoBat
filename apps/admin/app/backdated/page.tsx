import { Panel } from "../components/ui";
import { BackdatedActions } from "../components/BackdatedActions";
import { getBackdated } from "../lib/api";

export default async function BackdatedPage() {
  const { data: BACKDATED_REQUESTS } = await getBackdated();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Warranty</p>
          <h2 className="page-title">Backdated approvals</h2>
          <p className="page-sub">
            Registrations submitted outside the standard window need an admin
            decision before the warranty activates.
          </p>
        </div>
      </div>

      <Panel title={`Pending requests (${BACKDATED_REQUESTS.length})`}>
        <table className="table">
          <thead>
            <tr>
              <th>Request</th>
              <th>Serial</th>
              <th>Partner</th>
              <th>Purchase date</th>
              <th className="num">Delay</th>
              <th>Reason</th>
              <th className="actions-col">Decision</th>
            </tr>
          </thead>
          <tbody>
            {BACKDATED_REQUESTS.map((req) => (
              <tr key={req.id}>
                <td className="mono">{req.id}</td>
                <td className="mono">{req.serialNumber}</td>
                <td>{req.partner}</td>
                <td>{req.purchaseDate}</td>
                <td className="num">{req.delayDays} d</td>
                <td>{req.reason}</td>
                <td className="actions-col">
                  <BackdatedActions id={req.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
