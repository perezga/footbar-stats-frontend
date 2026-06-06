import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TrendPoint } from '../api/types.js';

export interface TrendSeries {
  /** Series key, also used as the legend label. */
  name: string;
  color: string;
  points: TrendPoint[];
}

interface Props {
  series: TrendSeries[];
  unit?: string;
}

function label(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function TrendChart({ series, unit }: Props) {
  // Merge all series onto a shared, chronologically-sorted date axis. Each row
  // holds whichever series have a session on that date; gaps are bridged with
  // connectNulls so the two lines stay readable.
  const byDate = new Map<string, Record<string, string | number>>();
  for (const s of series) {
    for (const p of s.points) {
      const row = byDate.get(p.start_date) ?? { sort: p.start_date, date: label(p.start_date) };
      row[s.name] = p.value;
      byDate.set(p.start_date, row);
    }
  }
  const data = [...byDate.values()].sort((a, b) =>
    String(a.sort).localeCompare(String(b.sort)),
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="#1f2937" />
        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
        <YAxis stroke="#94a3b8" fontSize={11} unit={unit ? ` ${unit}` : undefined} />
        <Tooltip
          contentStyle={{ background: '#0F1420', border: '1px solid #334155' }}
          labelStyle={{ color: '#cbd5e1' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
