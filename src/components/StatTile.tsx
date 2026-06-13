interface Props {
  label: string;
  value: string;
  sublabel?: string;
  tooltip?: string;
  /** Percent vs the player's recent average; undefined hides the delta. */
  delta?: number;
  /** True when lower is better (e.g. acceleration time): swaps the colors. */
  deltaInvert?: boolean;
  deltaTitle?: string;
}

function Delta({ delta, invert, title }: { delta: number; invert?: boolean; title?: string }) {
  if (Math.abs(delta) < 1) {
    return (
      <span title={title} className="text-xs font-normal text-slate-500">
        = media
      </span>
    );
  }
  const good = invert ? delta < 0 : delta > 0;
  return (
    <span
      title={title}
      className={`text-xs font-semibold ${good ? 'text-green-400' : 'text-red-400'}`}
    >
      {delta > 0 ? '▲ +' : '▼ '}
      {Math.round(delta)}%
    </span>
  );
}

export function StatTile({ label, value, sublabel, tooltip, delta, deltaInvert, deltaTitle }: Props) {
  return (
    <div title={tooltip} className="rounded-xl bg-brand-panel p-4 border border-slate-800">
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-2xl font-semibold text-slate-100 mt-1 flex items-baseline gap-2">
        {value}
        {delta !== undefined && <Delta delta={delta} invert={deltaInvert} title={deltaTitle} />}
      </div>
      {sublabel && <div className="text-xs text-slate-500 mt-1">{sublabel}</div>}
    </div>
  );
}
