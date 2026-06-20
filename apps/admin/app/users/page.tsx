import { PagePlaceholder } from "../components/ui";

export default function UsersPage() {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Administration</p>
          <h2 className="page-title">Users & roles</h2>
          <p className="page-sub">
            Manage admin users and role-based access to operations modules.
          </p>
        </div>
      </div>
      <PagePlaceholder
        title="User & role management"
        description="Invite admin users, assign roles, and scope access to the modules each team owns."
        bullets={[
          "Roles: warranty ops, claims reviewer, channel manager, auditor",
          "Per-module permission matrix",
          "OTP-based login and session management",
          "Deactivation and access review workflow"
        ]}
      />
    </div>
  );
}
