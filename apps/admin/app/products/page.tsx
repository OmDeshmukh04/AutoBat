import { Panel, Pill } from "../components/ui";
import { getProducts } from "../lib/api";

export default async function ProductsPage() {
  const { data: products } = await getProducts();

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Channel</p>
          <h2 className="page-title">Product catalogue</h2>
          <p className="page-sub">
            Battery families, SKUs, and the warranty policy bound to each.
          </p>
        </div>
        <button type="button" className="btn btn-primary">
          Add product
        </button>
      </div>

      <Panel title="Products">
        <table className="table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Family</th>
              <th>Voltage</th>
              <th>Capacity</th>
              <th>Policy</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="mono">{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.family}</td>
                <td>{product.voltage}</td>
                <td>{product.capacity}</td>
                <td>{product.policy}</td>
                <td>
                  <Pill tone={product.active ? "ok" : "muted"}>
                    {product.active ? "Active" : "Inactive"}
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
