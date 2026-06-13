import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DistanceBin } from '../api/types.js';
import { binOverlapsWindow, playedMinutesFromBins } from '../lib/units.js';

interface Props {
  bins: DistanceBin[];
  windowStart?: number;
  windowEnd?: number;
}

const ZONES = [
  { key: 'Walking', fill: '#475569' },
  { key: 'Running', fill: '#0ea5e9' },
  { key: 'Sprinting', fill: '#F7335D' },
] as const;

export function PaceZones({ bins, windowStart, windowEnd }: Props) {
  const hasWindow = windowStart != null && windowEnd != null;
  const data = bins.map((b, i) => ({
    bin: `+${i * 5}m`,
    Walking: b.low,
    Running: b.normal,
    Sprinting: b.high,
    inMatch: binOverlapsWindow(b, windowStart, windowEnd),
  }));
  const playedMin = playedMinutesFromBins(bins, windowStart, windowEnd);

  const firstIdx = data.findIndex((d) => d.inMatch);
  const lastIdx = data.reduce((acc, d, i) => (d.inMatch ? i : acc), -1);
  const showMarkers = hasWindow && firstIdx >= 0;

  return (
    <div className="rounded-xl bg-brand-panel p-4 border border-slate-800">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm uppercase tracking-wider text-slate-400">
          Distance by pace (5-min bins)
        </div>
        <div className="text-xs text-slate-400">≈ {playedMin} min on pitch</div>
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
          {ZONES.map((z) => (
            <Bar key={z.key} dataKey={z.key} stackId="a" fill={z.fill}>
              {data.map((d, i) => (
                <Cell key={i} fillOpacity={d.inMatch || !hasWindow ? 1 : 0.2} />
              ))}
            </Bar>
          ))}
          {showMarkers && (
            <ReferenceLine
              x={data[firstIdx]?.bin}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{ value: 'Inicio', position: 'top', fill: '#94a3b8', fontSize: 11 }}
            />
          )}
          {showMarkers && lastIdx !== firstIdx && (
            <ReferenceLine
              x={data[lastIdx]?.bin}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              label={{ value: 'Fin', position: 'top', fill: '#94a3b8', fontSize: 11 }}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
