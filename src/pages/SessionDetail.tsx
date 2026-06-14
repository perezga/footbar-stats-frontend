import { Link, useParams } from 'react-router-dom';
import { useAverages, useRefreshSession, useSession } from '../api/hooks.js';
import { ErrorAlert } from '../components/ErrorAlert.js';
import { MatchResult } from '../components/MatchResult.js';
import { MatchComparison } from '../components/MatchComparison.js';
import { PaceZones } from '../components/PaceZones.js';
import { SessionMap } from '../components/SessionMap.js';
import { StatTile } from '../components/StatTile.js';
import {
  firstActiveWindow,
  formatDateTime,
  formatKickoff,
  MATCH_TYPE_LABEL,
  matchWindow,
  msToKmh,
  mToKm,
  pct,
  playedMinutesFromBins,
  positionLabel,
  secToClock,
} from '../lib/units.js';

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const q = useSession(id!, !!id);
  const sessionId = Number(id);
  const isNumeric = Number.isFinite(sessionId);
  
  const refresh = useRefreshSession(isNumeric ? sessionId : 0);
  const avg = useAverages(q.data?.match_type ?? '11', isNumeric ? sessionId : 0, !!q.data && isNumeric);

  if (q.isLoading) return <div className="text-slate-400">Loading…</div>;
  if (q.error) return <ErrorAlert error={q.error} onRetry={() => q.refetch()} />;
  if (!q.data) return null;
  const s = q.data;

  const matchDate = s.fixture?.date || s.start_date.slice(0, 10);

  // Percent vs the recent-sessions mean; undefined (no delta shown) when the
  // metric is missing on either side or the mean is ~0.
  const delta = (key: string, v: number | null | undefined): number | undefined => {
    const a = avg.data?.averages[key];
    if (!a || typeof v !== 'number' || Math.abs(a.mean) < 1e-9) return undefined;
    return ((v - a.mean) / Math.abs(a.mean)) * 100;
  };
  const deltaTitle = avg.data
    ? `vs media de los últimos ${avg.data.count} ${MATCH_TYPE_LABEL[s.match_type]}`
    : undefined;
  // For matches, bound the pace metric to a 85-min match window: the fixture
  // kickoff when linked, otherwise (a match with no fixture) the first active bin.
  const win =
    matchWindow(s.fixture?.date, s.fixture?.time) ??
    (s.match_type === '11' ? firstActiveWindow(s.distance_5min ?? []) : null);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <Link to="/sessions" className="text-sm text-slate-400 hover:text-slate-200">
            ← All sessions
          </Link>
          {isNumeric && (
            <button
              type="button"
              onClick={() => refresh.mutate()}
              disabled={refresh.isPending}
              className="px-3 py-1 rounded-md border border-slate-700 text-sm hover:border-slate-500 disabled:opacity-50"
              title="Delete the cached data for this session and re-fetch it from Footbar"
            >
              {refresh.isPending ? 'Refreshing…' : '↻ Refresh'}
            </button>
          )}
        </div>
        {refresh.error && (
          <div className="mt-2">
            <ErrorAlert error={refresh.error} onRetry={() => refresh.mutate()} />
          </div>
        )}
        <h1 className="text-2xl font-semibold text-slate-100 mt-2">{s.title || 'Untitled'}</h1>
        <div className="text-slate-400 text-sm mt-1">
          {s.fixture ? formatKickoff(s.fixture.date, s.fixture.time) : formatDateTime(s.start_date)}{' '}
          · {MATCH_TYPE_LABEL[s.match_type]} · {positionLabel(s.position)}
          {typeof s.score_stars === 'number' && (
            <span className="ml-3 text-brand">★ {s.score_stars.toFixed(1)}</span>
          )}
        </div>
      </div>

      {s.fixture && <MatchResult fixture={s.fixture} />}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand"></span>
          Official Match Data (RFAF)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile
            label="Match Goals"
            value={String(s.fixture?.events.filter((e) => e.kind === 'goal').length ?? 0)}
            tooltip="Goles anotados en este partido según el acta oficial."
          />
          <StatTile
            label="Match Cards"
            value={String(s.fixture?.events.filter((e) => e.kind.includes('yellow') || e.kind === 'red').length ?? 0)}
            tooltip="Tarjetas recibidas en este partido según el acta oficial."
          />
          <StatTile
            label="Started (Titular)"
            value={s.fixture?.started ? 'Yes' : 'No'}
            tooltip="Indica si saliste en el once inicial del partido."
          />
          {s.distance_5min && s.distance_5min.length > 0 && (
            <StatTile
              label="Minutes Played"
              value={`${playedMinutesFromBins(s.distance_5min, win?.start, win?.end)} min`}
              tooltip="Tiempo total disputado en el terreno de juego (estimado por actividad)."
            />
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand"></span>
          Physical Performance (Footbar)
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile
            label="Distance"
            value={mToKm(s.distance)}
            delta={delta('distance', s.distance)}
            deltaTitle={deltaTitle}
          />
          <StatTile
            label="Top sprint"
            value={msToKmh(s.sprint_speed)}
            delta={delta('sprint_speed', s.sprint_speed)}
            deltaTitle={deltaTitle}
          />
          <StatTile
            label="Top shot"
            value={msToKmh(s.shot_speed)}
            delta={delta('shot_speed', s.shot_speed)}
            deltaTitle={deltaTitle}
          />
          <StatTile
            label="Sprints"
            value={String(s.sprint_count)}
            sublabel={`avg ${msToKmh(s.avg_sprint_speed)}`}
            delta={delta('sprint_count', s.sprint_count)}
            deltaTitle={deltaTitle}
          />
          <StatTile
            label="Shots"
            value={String(s.shot_count)}
            sublabel={`avg ${msToKmh(s.avg_shot_speed)}`}
            delta={delta('shot_count', s.shot_count)}
            deltaTitle={deltaTitle}
          />
          <StatTile
            label="Passes"
            value={String(s.pass_count)}
            delta={delta('pass_count', s.pass_count)}
            deltaTitle={deltaTitle}
          />
          <StatTile
            label="Activity"
            value={pct(s.activity)}
            delta={delta('activity', s.activity)}
            deltaTitle={deltaTitle}
          />
          <StatTile
            label="High-speed running"
            value={mToKm(s.hsr_plus)}
            delta={delta('hsr_plus', s.hsr_plus)}
            deltaTitle={deltaTitle}
          />
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand"></span>
          Advanced Match Insights
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatTile
            label="Efectividad de Tiro"
            value={(() => {
              const goals = s.fixture?.events.filter((e) => e.kind === 'goal').length ?? 0;
              return s.shot_count > 0 ? `${((goals / s.shot_count) * 100).toFixed(1)}%` : '—';
            })()}
            tooltip="Tus goles marcados divididos por el total de tiros registrados por el tracker."
          />
          <StatTile
            label="Resistencia Fatiga"
            value={(() => {
              if (!s.distance_5min || s.distance_5min.length < 4) return '—';
              const mid = Math.floor(s.distance_5min.length / 2);
              const dist1 = s.distance_5min.slice(0, mid).reduce((sum, b) => sum + b.low + b.normal + b.high, 0);
              const dist2 = s.distance_5min.slice(mid).reduce((sum, b) => sum + b.low + b.normal + b.high, 0);
              return dist1 > 0 ? `${((dist2 / dist1) * 100).toFixed(0)}%` : '—';
            })()}
            tooltip="Ratio de intensidad física en la 2ª parte vs la 1ª parte de este partido."
          />
          <StatTile
            label="Luka Modrić Score"
            value={(() => {
              if (s.id === null) return '—'; // No tracker data
              const goals = s.fixture?.events.filter((e) => e.kind === 'goal').length ?? 0;
              return (s.pass_count / 5 + s.distance / 1000 - goals * 5).toFixed(1);
            })()}
            tooltip="Índice que premia la distribución y el esfuerzo físico, penalizando el individualismo."
          />
          <StatTile
            label="Km por Gol"
            value={(() => {
              const goals = s.fixture?.events.filter((e) => e.kind === 'goal').length ?? 0;
              return goals > 0 ? (s.distance / 1000 / goals).toFixed(1) : '—';
            })()}
            tooltip="Kilómetros recorridos por cada gol marcado."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Time with ball"
          value={secToClock(s.time_with_ball)}
          delta={delta('time_with_ball', s.time_with_ball)}
          deltaTitle={deltaTitle}
        />
        <StatTile
          label="Dribbles"
          value={s.dribble_count != null ? String(s.dribble_count) : '—'}
          delta={delta('dribble_count', s.dribble_count)}
          deltaTitle={deltaTitle}
        />
        <StatTile
          label="Runs"
          value={s.run_count !== null ? String(s.run_count) : '—'}
          delta={delta('run_count', s.run_count)}
          deltaTitle={deltaTitle}
        />
        <StatTile
          label="Time running"
          value={secToClock(s.time_running)}
          delta={delta('time_running', s.time_running)}
          deltaTitle={deltaTitle}
        />
        <StatTile
          label="Acceleration"
          value={s.acceleration ? `${s.acceleration.toFixed(2)} s to 18 km/h` : '—'}
          delta={delta('acceleration', s.acceleration)}
          deltaInvert
          deltaTitle={deltaTitle}
        />
        <StatTile
          label="Stop & go"
          value={s.stop_and_go !== null ? s.stop_and_go.toFixed(1) : '—'}
          sublabel="rhythm changes / 5 min"
          delta={delta('stop_and_go', s.stop_and_go)}
          deltaTitle={deltaTitle}
        />
      </div>

      {s.distance_5min && s.distance_5min.length > 0 && (
        <PaceZones bins={s.distance_5min} windowStart={win?.start} windowEnd={win?.end} />
      )}

      <MatchComparison sessionA={s} date={matchDate} />

      {s.location?.coordinates && <SessionMap location={s.location} />}
    </div>
  );
}
