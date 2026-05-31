import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TrendPoint } from '../api/types.js';

interface Props {
  points: TrendPoint[];
  unit?: string;
}

export function TrendChart({ points, unit }: Props) {
  const data = points.map((p) => ({
    date: new Date(p.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    value: p.value,
    title: p.title,
  }));
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
        <Line type="monotone" dataKey="value" stroke="#F7335D" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
