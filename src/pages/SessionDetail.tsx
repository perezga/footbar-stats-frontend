import { Link, useParams } from 'react-router-dom';
import { useAverages, useRefreshSession, useSession } from '../api/hooks.js';
import { MatchResult } from '../components/MatchResult.js';
import { PaceZones } from '../components/PaceZones.js';
import { SessionMap } from '../components/SessionMap.js';
import { StatTile } from '../components/StatTile.js';
import {
  firstActiveWindow,
  formatDateTime,
  formatKickoff,
  matchWindow,
  MATCH_TYPE_LABEL,
  mToKm,
  msToKmh,
  pct,
  playedMinutesFromBins,
  positionLabel,
  secToClock,
} from '../lib/units.js';

export function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const sessionId = Number(id);
  const q = useSession(sessionId, Number.isFinite(sessionId));
  const refresh = useRefreshSession(sessionId);
  const avg = useAverages(q.data?.match_type ?? '11', sessionId, !!q.data);

  if (q.isLoading) return <div className="text-slate-400">Loading…</div>;
  if (q.error) return <div className="text-red-400">{(q.error as Error).message}</div>;
  if (!q.data) return null;
  const s = q.data;
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
          <button
            type="button"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending}
            className="px-3 py-1 rounded-md border border-slate-700 text-sm hover:border-slate-500 disabled:opacity-50"
            title="Delete the cached data for this session and re-fetch it from Footbar"
          >
            {refresh.isPending ? 'Refreshing…' : '↻ Refresh'}
          </button>
        </div>
        {refresh.error && (
          <div className="text-red-400 text-sm mt-2">{(refresh.error as Error).message}</div>
        )}
        <h1 className="text-2xl font-semibold text-slate-100 mt-2">{s.title || 'Untitled'}</h1>
        <div className="text-slate-400 text-sm mt-1">
          {s.fixture
            ? formatKickoff(s.fixture.date, s.fixture.time)
            : formatDateTime(s.start_date)}{' '}
          · {MATCH_TYPE_LABEL[s.match_type]} · {positionLabel(s.position)}
          {typeof s.score_stars === 'number' && (
            <span className="ml-3 text-brand">★ {s.score_stars.toFixed(1)}</span>
          )}
        </div>
      </div>

      {s.fixture && <MatchResult fixture={s.fixture} />}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="Distance"
          value={mToKm(s.distance)}
          delta={delta('distance', s.distance)}
          deltaTitle={deltaTitle}
        />
        <StatTile
          label="Playing time"
          value={secToClock(s.playing_time)}
          delta={delta('playing_time', s.playing_time)}
          deltaTitle={deltaTitle}
        />
        {s.distance_5min && s.distance_5min.length > 0 && (
          <StatTile
            label="Time on pitch (est.)"
            value={secToClock(playedMinutesFromBins(s.distance_5min, win?.start, win?.end) * 60)}
            sublabel="from active pace bins"
          />
        )}
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
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile
          label="High-speed running"
          value={mToKm(s.hsr_plus)}
          delta={delta('hsr_plus', s.hsr_plus)}
          deltaTitle={deltaTitle}
        />
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

      {s.location?.coordinates && <SessionMap location={s.location} />}
    </div>
  );
}
