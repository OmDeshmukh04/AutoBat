import type { ClaimStageCount, SalesPoint } from "../lib/mock-data";

// Lightweight inline charts (no chart library) to keep the admin bundle small.

export function SalesBars({ data }: { data: SalesPoint[] }) {
  const max = Math.max(...data.flatMap((d) => [d.sold, d.registered]));
  return (
    <div className="bars">
      <div className="bars-plot" role="img" aria-label="Units sold and registered by month">
        {data.map((point) => (
          <div key={point.month} className="bar-group">
            <div className="bar-pair">
              <span
                className="bar bar-sold"
                style={{ height: `${(point.sold / max) * 100}%` }}
                title={`${point.month}: ${point.sold} sold`}
              />
              <span
                className="bar bar-reg"
                style={{ height: `${(point.registered / max) * 100}%` }}
                title={`${point.month}: ${point.registered} registered`}
              />
            </div>
            <span className="bar-label">{point.month}</span>
          </div>
        ))}
      </div>
      <div className="legend">
        <span className="legend-item">
          <i className="swatch swatch-sold" /> Units sold
        </span>
        <span className="legend-item">
          <i className="swatch swatch-reg" /> Registered
        </span>
      </div>
    </div>
  );
}

export function FunnelBars({ data }: { data: ClaimStageCount[] }) {
  const max = Math.max(...data.map((d) => d.count));
  return (
    <div className="funnel">
      {data.map((stage) => (
        <div key={stage.stage} className="funnel-row">
          <span className="funnel-stage">{stage.stage}</span>
          <span className="funnel-track">
            <span
              className="funnel-fill"
              style={{ width: `${(stage.count / max) * 100}%` }}
            />
          </span>
          <span className="funnel-count">{stage.count}</span>
        </div>
      ))}
    </div>
  );
}
