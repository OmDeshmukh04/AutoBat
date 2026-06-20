import { Panel, Pill } from "../components/ui";
import { getActivity } from "../lib/api";

const KIND_TONE: Record<string, "ok" | "warn" | "muted"> = {
  Battery: "ok",
  Warranty: "ok",
  Claim: "warn",
  StockMovement: "muted",
  WarrantyPolicy: "muted",
  Organization: "ok"
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

export default async function AuditPage() {
  const { data: activity } = await getActivity();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Administration</p>
          <h2 className="page-title">Audit logs</h2>
          <p className="page-sub">
            Immutable record of actions taken across the platform.
          </p>
        </div>
        <button type="button" className="btn btn-ghost">
          Export
        </button>
      </div>

      <Panel title="Activity">
        <table className="table">
          <thead>
            <tr>
              <th>Actor</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Type</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((item) => (
              <tr key={item.id}>
                <td>{item.actor}</td>
                <td>{item.action}</td>
                <td className="mono">{item.entity}</td>
                <td>
                  <Pill tone={KIND_TONE[item.entityType] ?? "muted"}>
                    {item.entityType}
                  </Pill>
                </td>
                <td>{relativeTime(item.at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
