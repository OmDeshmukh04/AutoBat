import { Panel, Pill } from "../components/ui";
import { getMovements } from "../lib/api";

const TYPE_TONE: Record<string, "ok" | "warn" | "bad" | "muted"> = {
  DISPATCH: "ok",
  TRANSFER: "warn",
  SALE: "ok",
  RETURN: "muted",
  RECYCLE: "bad"
};

const TYPE_LABEL: Record<string, string> = {
  DISPATCH: "Dispatch",
  TRANSFER: "Transfer",
  SALE: "Sale",
  RETURN: "Return",
  RECYCLE: "Recycle"
};

export default async function MovementsPage() {
  const { data: movements } = await getMovements();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2 className="page-title">Stock movements</h2>
          <p className="page-sub">
            Full history of dispatches, transfers, sales, and returns.
          </p>
        </div>
      </div>

      <Panel title="Movement ledger">
        <table className="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th className="num">Qty</th>
              <th>Reference</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((m) => (
              <tr key={m.id}>
                <td>
                  <Pill tone={TYPE_TONE[m.type] ?? "muted"}>
                    {TYPE_LABEL[m.type] ?? m.type}
                  </Pill>
                </td>
                <td>{m.from}</td>
                <td>{m.to}</td>
                <td className="num">{m.quantity.toLocaleString()}</td>
                <td className="mono">{m.reference}</td>
                <td>{m.at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
