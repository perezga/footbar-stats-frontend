import { useState } from 'react';
import { useRecords, useTrend, useAdvancedMetrics } from '../api/hooks.js';
import type { TrendPoint } from '../api/types.js';
import { RecordsCard } from '../components/RecordsCard.js';
import { TrendChart, type TrendSeries } from '../components/TrendChart.js';
import { StatTile } from '../components/StatTile.js';

const METRICS: { key: string; label: string; unit?: string; transform?: (v: number) => number }[] =
  [
    { key: 'distance', label: 'Distance (km)', unit: 'km', transform: (v) => v / 1000 },
    { key: 'goals', label: 'Goals' },
    { key: 'sprint_count', label: 'Sprints' },
    { key: 'sprint_speed', label: 'Top sprint (km/h)', unit: 'km/h', transform: (v) => v * 3.6 },
    { key: 'shot_speed', label: 'Top shot (km/h)', unit: 'km/h', transform: (v) => v * 3.6 },
    { key: 'pass_count', label: 'Passes' },
    { key: 'activity', label: 'Activity %', unit: '%', transform: (v) => (v <= 1 ? v * 100 : v) },
    { key: 'playing_time', label: 'Playing time (min)', unit: 'min', transform: (v) => v / 60 },
    { key: 'hsr_plus', label: 'High-speed running (km)', unit: 'km', transform: (v) => v / 1000 },
    { key: 'time_running', label: 'Time running (min)', unit: 'min', transform: (v) => v / 60 },
    { key: 'dribble_count', label: 'Dribbles' },
  ];

const MATCH_COLOR = '#F7335D'; // partidos (brand)
const TRAIN_COLOR = '#38bdf8'; // entrenamientos (sky)

function AdvancedInsights() {
  const { data: adv, isLoading } = useAdvancedMetrics();

  if (isLoading) return <div className="text-slate-400 text-sm italic animate-pulse">Computing analytical insights…</div>;
  if (!adv) return null;

  return (
    <div className="space-y-6">
      {/* RFAF Official Performance */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          Official Performance (RFAF)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatTile
            label="Contribución Goleadora"
            value={adv.goal_contribution_pct !== null ? `${adv.goal_contribution_pct.toFixed(1)}%` : '—'}
          />
          <StatTile
            label="Factor Clutch (75'+)"
            value={adv.clutch_factor_pct !== null ? `${adv.clutch_factor_pct.toFixed(0)}%` : '—'}
          />
          <StatTile
            label="Disciplina (min/tarjeta)"
            value={adv.discipline_rating !== null ? adv.discipline_rating.toFixed(0) : '—'}
          />
          <StatTile
            label="Índice de Consistencia"
            value={adv.consistency_index !== null ? `${adv.consistency_index} 🔥` : '—'}
          />
          <StatTile
            label="Impacto PPG"
            value={adv.ppg_impact !== null ? `${adv.ppg_impact > 0 ? '+' : ''}${adv.ppg_impact.toFixed(2)}` : '—'}
          />
          <StatTile
            label="Percentil Goleador"
            value={adv.scorer_percentile !== null ? `Top ${Math.max(1, 100 - adv.scorer_percentile).toFixed(0)}%` : '—'}
          />
        </div>
      </section>

      {/* Combined Pro Insights */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand"></span>
          Pro Insights (Footbar + RFAF)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatTile
            label="Efectividad de Tiro"
            value={adv.shot_conversion_pct !== null ? `${adv.shot_conversion_pct.toFixed(1)}%` : '—'}
          />
          <StatTile
            label="Km por Gol"
            value={adv.distance_per_goal_km !== null ? adv.distance_per_goal_km.toFixed(1) : '—'}
          />
          <StatTile
            label="Resistencia Fatiga"
            value={adv.fatigue_resistance_pct !== null ? `${adv.fatigue_resistance_pct.toFixed(0)}%` : '—'}
          />
          <StatTile
            label="Workrate Win %"
            value={adv.workrate_win_pct !== null ? `${adv.workrate_win_pct.toFixed(0)}%` : '—'}
          />
          <StatTile
            label="Luka Modrić Score"
            value={adv.luka_modric_score !== null ? adv.luka_modric_score.toFixed(1) : '—'}
          />
          <StatTile
            label="Intensidad vs Rank"
            value={adv.intensity_vs_rank_ratio !== null ? `${(adv.intensity_vs_rank_ratio * 100).toFixed(0)}%` : '—'}
          />
          <StatTile
            label="Intensidad W/L"
            value={adv.workload_win_vs_loss_ratio !== null ? `${(adv.workload_win_vs_loss_ratio * 100).toFixed(0)}%` : '—'}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="text-[10px] text-slate-500 space-y-1">
            <p><strong>Impacto PPG:</strong> Diferencia de puntos por partido con vs sin el jugador.</p>
            <p><strong>Resistencia Fatiga:</strong> Ratio de distancia recorrida en la 2ª parte vs 1ª parte.</p>
          </div>
          <div className="text-[10px] text-slate-500 space-y-1">
            <p><strong>Luka Modrić Score:</strong> Valora pases y distancia, penaliza perfiles goleadores egoístas.</p>
            <p><strong>Intensidad vs Rank:</strong> Esfuerzo contra el Top 5 vs el resto. &gt;100% significa que te creces ante los grandes.</p>
            <p><strong>Workrate Win %:</strong> Porcentaje de victorias cuando corres más de tu media habitual.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function Stats() {
  const [metric, setMetric] = useState(METRICS[0]?.key);
  const cfg = METRICS.find((m) => m.key === metric)!;

  const matchTrend = useTrend(metric ?? '', '11', !!metric);
  const trainTrend = useTrend(metric ?? '', 'tr', !!metric);

  const matchRecords = useRecords('11', true);
  const trainRecords = useRecords('tr', true);

  const tf = (pts: TrendPoint[] | undefined): TrendPoint[] =>
    (pts ?? []).map((p) => ({ ...p, value: cfg.transform ? cfg.transform(p.value) : p.value }));

  const series: TrendSeries[] = [
    { name: 'Partidos', color: MATCH_COLOR, points: tf(matchTrend.data?.points) },
    { name: 'Entrenamientos', color: TRAIN_COLOR, points: tf(trainTrend.data?.points) },
  ];
  const trendLoading = matchTrend.isLoading || trainTrend.isLoading;
  const hasTrendData = series.some((s) => s.points.length > 0);

  return (
    <div className="space-y-6">
      <AdvancedInsights />

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
          {trendLoading && <div className="text-slate-400 text-sm">Loading…</div>}
          {hasTrendData ? (
            <TrendChart series={series} unit={cfg.unit} />
          ) : (
            !trendLoading && (
              <div className="text-slate-400 text-sm">
                Open a few sessions on the Sessions tab to populate the trend.
              </div>
            )
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {matchRecords.data && (
          <RecordsCard title="Records · Partidos" records={matchRecords.data.records} />
        )}
        {trainRecords.data && (
          <RecordsCard title="Records · Entrenamientos" records={trainRecords.data.records} />
        )}
      </div>
    </div>
  );
}
