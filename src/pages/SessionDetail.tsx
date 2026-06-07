import { Link, useParams } from 'react-router-dom';
import { useRefreshSession, useSession } from '../api/hooks.js';
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

  if (q.isLoading) return <div className="text-slate-400">Loading…</div>;
  if (q.error) return <div className="text-red-400">{(q.error as Error).message}</div>;
  if (!q.data) return null;
  const s = q.data;
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
        <StatTile label="Distance" value={mToKm(s.distance)} />
        <StatTile label="Playing time" value={secToClock(s.playing_time)} />
        {s.distance_5min && s.distance_5min.length > 0 && (
          <StatTile
            label="Time on pitch (est.)"
            value={secToClock(playedMinutesFromBins(s.distance_5min, win?.start, win?.end) * 60)}
            sublabel="from active pace bins"
          />
        )}
        <StatTile label="Top sprint" value={msToKmh(s.sprint_speed)} />
        <StatTile label="Top shot" value={msToKmh(s.shot_speed)} />
        <StatTile
          label="Sprints"
          value={String(s.sprint_count)}
          sublabel={`avg ${msToKmh(s.avg_sprint_speed)}`}
        />
        <StatTile
          label="Shots"
          value={String(s.shot_count)}
          sublabel={`avg ${msToKmh(s.avg_shot_speed)}`}
        />
        <StatTile label="Passes" value={String(s.pass_count)} />
        <StatTile label="Activity" value={pct(s.activity)} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="High-speed running" value={mToKm(s.hsr_plus)} />
        <StatTile label="Time with ball" value={secToClock(s.time_with_ball)} />
        <StatTile
          label="Acceleration"
          value={s.acceleration ? `${s.acceleration.toFixed(2)} s to 18 km/h` : '—'}
        />
        <StatTile
          label="Stop & go"
          value={s.stop_and_go !== null ? s.stop_and_go.toFixed(1) : '—'}
          sublabel="rhythm changes / 5 min"
        />
      </div>

      {s.distance_5min && s.distance_5min.length > 0 && (
        <PaceZones bins={s.distance_5min} windowStart={win?.start} windowEnd={win?.end} />
      )}

      {s.location?.coordinates && <SessionMap location={s.location} />}
    </div>
  );
}
