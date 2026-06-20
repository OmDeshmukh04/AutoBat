import Link from "next/link";
import { FunnelBars, SalesBars } from "./components/MiniCharts";
import { MetricCard, Panel, Pill } from "./components/ui";
import { ATTENTION_ITEMS, CLAIM_FUNNEL, SALES_TREND } from "./lib/mock-data";
import type { Metric } from "./lib/mock-data";
import { getActivity, getDashboardMetrics } from "./lib/api";

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

export default async function DashboardPage() {
  const [{ data: m, live }, { data: activity }] = await Promise.all([
    getDashboardMetrics(),
    getActivity()
  ]);

  const warrantyMetrics: Metric[] = [
    {
      label: "Active warranties",
      value: m.warranty.active.toLocaleString(),
      delta: "+4.2%",
      trend: "up",
      hint: "vs. last 30 days"
    },
    {
      label: "Backdated pending",
      value: m.warranty.pendingBackdated.toLocaleString(),
      delta: "awaiting",
      trend: "flat",
      hint: "needs approval"
    }
  ];

  const salesMetrics: Metric[] = [
    {
      label: "Units sold",
      value: m.sales.soldUnits.toLocaleString(),
      delta: "+6.5%",
      trend: "up",
      hint: "lifetime to date"
    },
    {
      label: "Active partners",
      value: m.sales.partnerCount.toLocaleString(),
      delta: "+2",
      trend: "up",
      hint: "dealers & distributors"
    }
  ];

  const stockMetrics: Metric[] = [
    {
      label: "Batteries in stock",
      value: m.stock.inStock.toLocaleString(),
      delta: "-2.1%",
      trend: "down",
      hint: "across the channel"
    },
    {
      label: "In transit",
      value: m.stock.inTransit.toLocaleString(),
      delta: "open",
      trend: "flat",
      hint: "shipments en route"
    }
  ];

  const claimMetrics: Metric[] = [
    {
      label: "Open claims",
      value: m.claims.open.toLocaleString(),
      delta: `${m.claims.overSla} SLA`,
      trend: m.claims.overSla > 0 ? "up" : "flat",
      hint: "over SLA highlighted"
    },
    {
      label: "Approval rate",
      value: `${m.claims.approvalRate}%`,
      delta: "+2 pts",
      trend: "up",
      hint: "last 30 days"
    }
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <p className="eyebrow">Warranty operations</p>
          <h2 className="page-title">Operational overview</h2>
          <p className="page-sub">
            Live snapshot of warranty, sales, stock, and claim performance across
            the channel.
          </p>
        </div>
        <div className="page-head-actions">
          <Pill tone={live ? "ok" : "warn"}>
            {live ? "Live data" : "Demo data"}
          </Pill>
          <Link className="btn btn-primary" href="/registrations">
            Review registrations
          </Link>
        </div>
      </div>

      <MetricGroup title="Warranty" href="/registrations" metrics={warrantyMetrics} />
      <MetricGroup title="Sales & stock" href="/movements" metrics={[...salesMetrics, ...stockMetrics]} />
      <MetricGroup title="Claims" href="/claims" metrics={claimMetrics} />

      <div className="grid-2">
        <Panel
          title="Sales vs. registrations"
          action={<span className="panel-note">Last 6 months</span>}
        >
          <SalesBars data={SALES_TREND} />
        </Panel>

        <Panel
          title="Claims pipeline"
          action={
            <Link className="link" href="/claims">
              Open workbench
            </Link>
          }
        >
          <FunnelBars data={CLAIM_FUNNEL} />
        </Panel>
      </div>

      <div className="grid-2">
        <Panel
          title="Recent activity"
          action={
            <Link className="link" href="/audit">
              View audit log
            </Link>
          }
        >
          <ul className="activity">
            {activity.map((item) => (
              <li key={item.id} className="activity-row">
                <Pill tone={KIND_TONE[item.entityType] ?? "muted"}>
                  {item.entityType}
                </Pill>
                <span className="activity-text">
                  <strong>{item.actor}</strong> {item.action}{" "}
                  <span className="mono">{item.entity}</span>
                </span>
                <span className="activity-time">{relativeTime(item.at)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Needs attention">
          <ul className="attention">
            {ATTENTION_ITEMS.map((item) => (
              <li key={item.id} className={`attention-row sev-${item.severity}`}>
                <span className="sev-dot" aria-hidden />
                <span className="attention-body">
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function MetricGroup({
  title,
  href,
  metrics
}: {
  title: string;
  href: string;
  metrics: Metric[];
}) {
  return (
    <section className="metric-group">
      <div className="metric-group-head">
        <h3>{title}</h3>
        <Link className="link" href={href}>
          Details
        </Link>
      </div>
      <div className="metric-grid">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>
    </section>
  );
}
