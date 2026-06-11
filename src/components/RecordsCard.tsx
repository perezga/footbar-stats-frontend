import { Link } from 'react-router-dom';
import type { RecordEntry } from '../api/types.js';
import { formatDate, msToKmh, mToKm, secToClock } from '../lib/units.js';

interface Props {
  records: RecordEntry[];
  title?: string;
}

function formatValue(metric: string, value: number): string {
  if (/distance/i.test(metric) || /high-speed/i.test(metric)) return mToKm(value);
  if (/speed/i.test(metric)) return msToKmh(value);
  if (/playing time/i.test(metric)) return secToClock(value);
  return Math.round(value).toString();
}

export function RecordsCard({ records, title = 'Personal records' }: Props) {
  if (records.length === 0) {
    return (
      <div className="rounded-xl bg-brand-panel p-6 border border-slate-800 text-slate-400">
        <div className="text-sm uppercase tracking-wider mb-2">{title}</div>
        No records yet — open a few sessions to populate stats.
      </div>
    );
  }
  return (
    <div className="rounded-xl bg-brand-panel border border-slate-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800 text-sm uppercase tracking-wider text-slate-400">
        {title}
      </div>
      <ul className="divide-y divide-slate-800">
        {records.map((r) => (
          <li key={r.metric} className="px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm text-slate-300">{r.metric}</div>
              <Link
                to={`/sessions/${r.session_id}`}
                className="text-xs text-slate-500 hover:text-brand"
              >
                {r.session_title} · {formatDate(r.start_date)}
              </Link>
            </div>
            <div className="text-xl font-semibold text-brand">{formatValue(r.metric, r.value)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
