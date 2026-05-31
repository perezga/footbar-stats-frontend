interface Props {
  label: string;
  value: string;
  sublabel?: string;
}

export function StatTile({ label, value, sublabel }: Props) {
  return (
    <div className="rounded-xl bg-brand-panel p-4 border border-slate-800">
      <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-2xl font-semibold text-slate-100 mt-1">{value}</div>
      {sublabel && <div className="text-xs text-slate-500 mt-1">{sublabel}</div>}
    </div>
  );
}
