import { PagePlaceholder } from "../components/ui";

export default function RegistrationsPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Warranty</p>
          <h2 className="page-title">Warranty registrations</h2>
          <p className="page-sub">
            Searchable list of every customer warranty registration.
          </p>
        </div>
      </div>
      <PagePlaceholder
        title="Registration list & detail view"
        description="Filterable table of registrations with drill-down to the warranty certificate, policy snapshot, and customer OTP confirmation status."
        bullets={[
          "Search by serial number, customer mobile, or partner",
          "Phase chips (free replacement / pro-rata / expired)",
          "Detail drawer with policy snapshot and audit trail",
          "Wires to GET /api/warranties once the endpoint lands"
        ]}
      />
    </div>
  );
}
