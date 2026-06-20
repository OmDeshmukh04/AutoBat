import type { ReactNode } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metric, Trend } from "../lib/mock-data";

export function MetricCard({ metric }: { metric: Metric }) {
  const trendClass = `delta delta-${metric.trend}`;
  return (
    <article className="metric-card">
      <p className="metric-label">{metric.label}</p>
      <p className="metric-value">{metric.value}</p>
      <p className="metric-foot">
        <span className={trendClass}>
          <TrendIcon trend={metric.trend} />
          {metric.delta}
        </span>
        <span className="metric-hint">{metric.hint}</span>
      </p>
    </article>
  );
}

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <ArrowUpRight size={14} aria-hidden />;
  if (trend === "down") return <ArrowDownRight size={14} aria-hidden />;
  return <ArrowRight size={14} aria-hidden />;
}

export function Panel({
  title,
  action,
  children,
  className
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel${className ? ` ${className}` : ""}`}>
      <div className="panel-head">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

type Tone = "ok" | "warn" | "bad" | "muted";

export function Pill({
  children,
  tone = "muted"
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

export function PagePlaceholder({
  title,
  description,
  bullets
}: {
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <div className="placeholder">
      <p className="eyebrow">Coming next</p>
      <h2>{title}</h2>
      <p className="placeholder-desc">{description}</p>
      <ul className="placeholder-list">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </div>
  );
}
