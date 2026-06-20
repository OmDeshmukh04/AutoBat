import { PagePlaceholder } from "../components/ui";

export default function NotificationsPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Administration</p>
          <h2 className="page-title">Notifications</h2>
          <p className="page-sub">
            Configure WhatsApp and SMS messages sent to partners and customers.
          </p>
        </div>
      </div>
      <PagePlaceholder
        title="Notification templates & log"
        description="Manage transactional message templates and review delivery status across channels."
        bullets={[
          "Customer OTP and warranty confirmation templates",
          "Claim status and replacement-ready alerts",
          "Partner low-stock and approval reminders",
          "Delivery log with provider status per message"
        ]}
      />
    </div>
  );
}
