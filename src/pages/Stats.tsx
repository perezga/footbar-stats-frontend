import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStatus, useRecords, useTrend } from '../api/hooks.js';
import type { MatchType, RecordEntry } from '../api/types.js';
import { ErrorAlert } from '../components/ErrorAlert.js';
import { RecordsCard } from '../components/RecordsCard.js';
import { TrendChart } from '../components/TrendChart.js';

const METRICS = [
  { key: 'distance', label: 'Distancia (m)' },
  { key: 'playing_time', label: 'Tiempo (min)' },
  { key: 'sprint_count', label: 'Sprints' },
  { key: 'sprint_speed', label: 'Velocidad punta (m/s)' },
  { key: 'shot_speed', label: 'Potencia de tiro (m/s)' },
  { key: 'shot_count', label: 'Tiros' },
  { key: 'pass_count', label: 'Pases' },
  { key: 'hsr_plus', label: 'HSR+ (m)' },
  { key: 'goals', label: 'Goles (Liga)' },
] as const;

export function Stats() {
  const { data: auth } = useAuthStatus();
  const [metric, setMetric] = useState(METRICS[0]!.key);
  const cfg = METRICS.find((m) => m.key === metric)!;

  const matchTrend = useTrend(metric, '11', !!auth?.links.footbar);
  const fiveTrend = useTrend(metric, 'ss', !!auth?.links.footbar);
  const matchRecords = useRecords('11', !!auth?.links.footbar);
  const fiveRecords = useRecords('ss', !!auth?.links.footbar);

  if (!auth?.links.footbar) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Detailed Statistics</h2>
        <p className="text-slate-400 max-w-sm mb-6">
          Connect your Footbar account to analyze your performance trends and see your personal
          records.
        </p>
        <Link to="/" className="bg-brand text-white px-6 py-2 rounded-lg font-bold">
          Go to Profile
        </Link>
      </div>
    );
  }

  const allRecords: RecordEntry[] = [
    ...(matchRecords.data?.records ?? []),
    ...(fiveRecords.data?.records ?? []),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-white mb-6">Tendencias</h1>
        <div className="flex flex-wrap gap-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                metric === m.key
                  ? 'bg-brand text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {m.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TrendChart
          title="Fútbol 11"
          points={matchTrend.data?.points ?? []}
          isLoading={matchTrend.isLoading}
          error={matchTrend.error}
          label={cfg.label}
        />
        <TrendChart
          title="Fútbol 5/7"
          points={fiveTrend.data?.points ?? []}
          isLoading={fiveTrend.isLoading}
          error={fiveTrend.error}
          label={cfg.label}
        />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Récords Personales</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <RecordsCard
            title="Fútbol 11"
            records={matchRecords.data?.records ?? []}
            isLoading={matchRecords.isLoading}
          />
          <RecordsCard
            title="Fútbol 5/7"
            records={fiveRecords.data?.records ?? []}
            isLoading={fiveRecords.isLoading}
          />
        </div>
      </div>
    </div>
  );
}
