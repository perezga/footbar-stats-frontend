import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DistanceBin } from '../api/types.js';

interface Props {
  bins: DistanceBin[];
}

export function PaceZones({ bins }: Props) {
  const data = bins.map((b, i) => ({
    bin: `+${i * 5}m`,
    Walking: b.low,
    Running: b.normal,
    Sprinting: b.high,
  }));
  return (
    <div className="rounded-xl bg-brand-panel p-4 border border-slate-800">
      <div className="text-sm uppercase tracking-wider text-slate-400 mb-2">
        Distance by pace (5-min bins)
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid stroke="#1f2937" />
          <XAxis dataKey="bin" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#94a3b8" fontSize={11} unit=" m" />
          <Tooltip
            contentStyle={{ background: '#0F1420', border: '1px solid #334155' }}
            labelStyle={{ color: '#cbd5e1' }}
          />
          <Bar dataKey="Walking" stackId="a" fill="#475569" />
          <Bar dataKey="Running" stackId="a" fill="#0ea5e9" />
          <Bar dataKey="Sprinting" stackId="a" fill="#F7335D" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
