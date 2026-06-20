import { Panel, Pill } from "../components/ui";
import { STATUS_TONE } from "../lib/mock-data";
import { getInventory } from "../lib/api";

const STATUS_LABEL: Record<string, string> = {
  MANUFACTURED: "Manufactured",
  IN_STOCK: "In stock",
  IN_TRANSIT: "In transit",
  SOLD: "Sold",
  UNDER_CLAIM: "Under claim",
  REPLACED: "Replaced",
  RETURNED: "Returned",
  RECYCLED: "Recycled"
};

export default async function InventoryPage() {
  const { data: units } = await getInventory();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Inventory</p>
          <h2 className="page-title">Serialized inventory</h2>
          <p className="page-sub">
            Every battery tracked by serial number through its lifecycle.
          </p>
        </div>
        <button type="button" className="btn btn-ghost">
          Import serials
        </button>
      </div>

      <Panel title="Units">
        <table className="table">
          <thead>
            <tr>
              <th>Serial number</th>
              <th>Product</th>
              <th>Status</th>
              <th>Current holder</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.serialNumber}>
                <td className="mono">{unit.serialNumber}</td>
                <td>{unit.product}</td>
                <td>
                  <Pill tone={STATUS_TONE[unit.status] ?? "muted"}>
                    {STATUS_LABEL[unit.status] ?? unit.status}
                  </Pill>
                </td>
                <td>{unit.holder}</td>
                <td>{unit.updatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
