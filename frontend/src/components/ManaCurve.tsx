interface Props {
  costs: Record<number, number>;
  maxCost?: number;
}

export default function ManaCurve({ costs, maxCost = 10 }: Props) {
  const entries = Array.from({ length: maxCost + 1 }, (_, i) => ({
    cost: i,
    count: costs[i] ?? 0,
  }));
  const max = Math.max(...entries.map(e => e.count), 1);

  return (
    <div className="curve">
      {entries.map(({ cost, count }) => (
        <div key={cost} className="curve-col">
          {count > 0 && <span className="bar-count">{count}</span>}
          <div
            className="bar"
            style={{ height: `${(count / max) * 100}%` }}
          />
          <span className="bar-label">{cost}</span>
        </div>
      ))}
    </div>
  );
}
