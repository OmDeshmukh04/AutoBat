import { PagePlaceholder } from "../components/ui";

export default function DeliveriesPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Claims & service</p>
          <h2 className="page-title">Delivery & returns</h2>
          <p className="page-sub">
            Track replacement deliveries and old-battery returns end to end.
          </p>
        </div>
      </div>
      <PagePlaceholder
        title="Delivery & return tracking"
        description="Monitor delivery runs created from approved claims and dispatches, with proof of delivery and return reconciliation."
        bullets={[
          "Open delivery runs with assigned drivers and stops",
          "Proof of delivery (signature / photo) per stop",
          "Damage, shortage, and rejection reports",
          "Old-battery pickup and recycler hand-off"
        ]}
      />
    </div>
  );
}
