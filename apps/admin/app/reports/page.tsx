import { PagePlaceholder } from "../components/ui";

export default function ReportsPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Administration</p>
          <h2 className="page-title">Reports</h2>
          <p className="page-sub">
            Exportable warranty, sales, stock, and claim reports.
          </p>
        </div>
      </div>
      <PagePlaceholder
        title="Reporting & exports"
        description="Build and schedule reports across warranty performance, channel sales, stock ageing, and claim outcomes."
        bullets={[
          "Warranty registrations and expiry forecasting",
          "Sales and sell-through by partner and region",
          "Stock ageing and reorder recommendations",
          "Claim approval rates and resolution times",
          "CSV / PDF export and scheduled email delivery"
        ]}
      />
    </div>
  );
}
