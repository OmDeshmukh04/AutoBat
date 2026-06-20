import { Panel, Pill } from "../components/ui";
import { getPartners } from "../lib/api";

const TYPE_LABEL: Record<string, string> = {
  DISTRIBUTOR: "Distributor",
  DEALER: "Dealer",
  SERVICE_POINT: "Service point",
  RECYCLER: "Recycler"
};

export default async function PartnersPage() {
  const { data: partners } = await getPartners();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Channel</p>
          <h2 className="page-title">Dealers & distributors</h2>
          <p className="page-sub">{partners.length} partners across the network.</p>
        </div>
        <button type="button" className="btn btn-primary">
          Add partner
        </button>
      </div>

      <Panel title="All partners">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Region</th>
              <th className="num">Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {partners.map((partner) => (
              <tr key={partner.id}>
                <td className="mono">{partner.code}</td>
                <td>{partner.name}</td>
                <td>{TYPE_LABEL[partner.type] ?? partner.type}</td>
                <td>{partner.region}</td>
                <td className="num">{partner.stock.toLocaleString()}</td>
                <td>
                  <Pill tone={partner.active ? "ok" : "muted"}>
                    {partner.active ? "Active" : "Inactive"}
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
