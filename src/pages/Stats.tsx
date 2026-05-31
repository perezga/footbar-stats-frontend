import { useState } from 'react';
import { useRecords, useTrend } from '../api/hooks.js';
import { RecordsCard } from '../components/RecordsCard.js';
import { TrendChart } from '../components/TrendChart.js';

const METRICS: { key: string; label: string; unit?: string; transform?: (v: number) => number }[] = [
  { key: 'distance', label: 'Distance (km)', unit: 'km', transform: (v) => v / 1000 },
  { key: 'sprint_count', label: 'Sprints' },
  { key: 'sprint_speed', label: 'Top sprint (km/h)', unit: 'km/h', transform: (v) => v * 3.6 },
  { key: 'shot_speed', label: 'Top shot (km/h)', unit: 'km/h', transform: (v) => v * 3.6 },
  { key: 'pass_count', label: 'Passes' },
  { key: 'activity', label: 'Activity %', unit: '%', transform: (v) => (v <= 1 ? v * 100 : v) },
  { key: 'playing_time', label: 'Playing time (min)', unit: 'min', transform: (v) => v / 60 },
  { key: 'hsr_plus', label: 'High-speed running (km)', unit: 'km', transform: (v) => v / 1000 },
];

export function Stats() {
  const [metric, setMetric] = useState(METRICS[0]!.key);
  const records = useRecords(true);
  const trend = useTrend(metric, true);
  const cfg = METRICS.find((m) => m.key === metric)!;
  const points =
    trend.data?.points.map((p) => ({
      ...p,
      value: cfg.transform ? cfg.transform(p.value) : p.value,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-brand-panel border border-slate-800 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="metric" className="text-sm text-slate-400">
            Trend metric
          </label>
          <select
            id="metric"
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="bg-brand-dark border border-slate-700 rounded-md px-3 py-1.5 text-sm"
          >
            {METRICS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-4">
          {trend.isLoading && <div className="text-slate-400 text-sm">Loading…</div>}
          {points.length > 0 ? (
            <TrendChart points={points} unit={cfg.unit} />
          ) : (
            !trend.isLoading && (
              <div className="text-slate-400 text-sm">
                Open a few sessions on the Sessions tab to populate the trend.
              </div>
            )
          )}
        </div>
      </div>

      {records.data && <RecordsCard records={records.data.records} />}
    </div>
  );
}
