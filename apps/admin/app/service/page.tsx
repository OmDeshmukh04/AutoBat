import { PagePlaceholder } from "../components/ui";

export default function ServicePage() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Claims & service</p>
          <h2 className="page-title">Service points</h2>
          <p className="page-sub">
            Manage service points that perform field tests and replacements.
          </p>
        </div>
      </div>
      <PagePlaceholder
        title="Service point management"
        description="Onboard and monitor service points, their test capacity, and turnaround on assigned claims."
        bullets={[
          "Service point directory with coverage region",
          "Assigned vs. completed claims and SLA adherence",
          "Test equipment and certified technicians",
          "Replacement stock held at each point"
        ]}
      />
    </div>
  );
}
