import {
  useLevel,
  usePlayerStats,
  useProfile,
  useRecords,
  useScorers,
  useSessions,
  usePlayers,
} from '../api/hooks.js';
import { usePlayerContext } from '../api/PlayerContext.js';
import type { PlayerStats } from '../api/types.js';
import { ErrorAlert } from '../components/ErrorAlert.js';
import { MatchHero } from '../components/MatchHero.js';
import { PlayerCard } from '../components/PlayerCard.js';
import { PlayerLevelCard } from '../components/PlayerLevelCard.js';
import { StatTile } from '../components/StatTile.js';

const FOOT_LABEL: Record<string, string> = { r: 'Right', l: 'Left', b: 'Both', n: 'None' };
const GENDER_LABEL: Record<string, string> = { m: 'Male', f: 'Female' };
const STRENGTH_LABEL: Record<string, string> = {
  tec: 'Technical',
  pac: 'Sprinter',
  sta: 'Endurant',
  sho: 'Shooter',
  un: 'Undefined',
};

/** Cumulative season stats from Universo RFAF for the current season. */
function SeasonStats({ stats }: { stats: PlayerStats }) {
  const tiles: { label: string; value: string }[] = [
    ...stats.stats.map((s) => ({ label: s.name, value: String(s.value) })),
    ...stats.cards.map((c) => ({ label: c.name, value: String(c.value) })),
  ];
  // minutes_played is null when the competition doesn't publish minutes; the
  // per-game average comes back as 0 in that case, so gate both on it.
  if (stats.minutes_played !== null) {
    tiles.push({ label: 'Minutos jugados', value: String(stats.minutes_played) });
    if (stats.minutes_per_game !== null) {
      tiles.push({ label: 'Minutos por partido', value: String(stats.minutes_per_game) });
    }
  }
  if (tiles.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          Estadísticas acumuladas {stats.season}
        </h2>
        <div className="text-sm text-slate-400">
          {[stats.team, stats.category, stats.dorsal !== null ? `Dorsal ${stats.dorsal}` : null]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((t) => (
          <StatTile key={t.label} label={t.label} value={t.value} />
        ))}
      </div>
    </section>
  );
}
export function Profile() {
  const { activePlayerId } = usePlayerContext();
  const { data: players } = usePlayers();
  const q = useProfile(true);
  const rfaf = usePlayerStats(true);
  const records = useRecords('11', true);
  const scorers = useScorers(true, '');
  const matches = useSessions({ matchType: '11', includeFixtures: true, limit: 200 }, true);
  const level = useLevel(true);

  const player = players?.find((p) => p.id === activePlayerId);

  // Treat 404 as "unlinked" instead of a hard error.
  const is404 = (q.error as any)?.status === 404;

  if (q.isLoading) return <div className="text-slate-400">Loading…</div>;
  if (q.error && !is404) return <ErrorAlert error={q.error} onRetry={() => q.refetch()} />;

  // Handle unlinked player or missing profile
  const p = q.data;
  if (!p || is404) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 text-2xl font-bold">
            {player?.name?.[0] || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-100">{player?.name || 'Player'}</h1>
            <div className="text-slate-400">RFAF Profile Linked</div>
          </div>
        </div>

        {!player?.footbar_user_id && (
          <div className="bg-brand/10 border border-brand/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-brand font-semibold">Connect Footbar</h3>
              <p className="text-sm text-slate-400">Link your tracker to see your heatmap, sprints, and game stats here.</p>
            </div>
            <a
              href={`/auth/login?playerId=${activePlayerId}`}
              className="bg-brand hover:bg-brand/90 text-white font-bold py-2 px-6 rounded-md transition-colors whitespace-nowrap"
            >
              Connect Now
            </a>
          </div>
        )}

        {level.data && <PlayerLevelCard data={level.data} />}

        {rfaf.data && <SeasonStats stats={rfaf.data.results} />}

        {matches.data && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-100">League Matches</h2>
            <MatchHero matches={matches.data.results} />
          </div>
        )}

        <PlayerCard
          profile={{
            user_id: 0,
            nickname: player?.name || 'Player',
            first_name: player?.name || '',
            last_name: '',
            age_category: '',
            fav_position: '',
            fav_foot: 'n',
            strength: 'un',
            gender: 'm',
            d_o_b: '',
            height: 0,
            weight: 0,
            profile_pic: '',
            country_flag: '',
          }}
          stats={rfaf.data?.results}
          scorer={scorers.data?.results.find((s) => s.own)}
          records={records.data?.records ?? []}
          matches={matches.data?.results ?? []}
        />
      </div>
    );
  }

  const name = `${p.first_name} ${p.last_name}`.trim() || p.nickname;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
...
        {p.profile_pic && (
          <img
            src={p.profile_pic}
            alt=""
            className="h-20 w-20 rounded-full border border-slate-700"
          />
        )}
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{name}</h1>
          <div className="text-slate-400">@{p.nickname}</div>
        </div>
        {p.country_flag && (
          <img src={p.country_flag} alt="" className="h-8 w-auto ml-auto rounded" />
        )}
      </div>

      {level.data && <PlayerLevelCard data={level.data} />}

      {matches.data && <MatchHero matches={matches.data.results} />}

      <PlayerCard
        profile={p}
        stats={rfaf.data?.results}
        scorer={scorers.data?.results.find((s) => s.own)}
        records={records.data?.records ?? []}
        matches={matches.data?.results ?? []}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Age category" value={p.age_category} />
        <StatTile label="Favourite position" value={p.fav_position || '—'} />
        <StatTile label="Favourite foot" value={FOOT_LABEL[p.fav_foot ?? 'n'] ?? '—'} />
        <StatTile label="Player type" value={STRENGTH_LABEL[p.strength] ?? '—'} />
        <StatTile label="Gender" value={GENDER_LABEL[p.gender] ?? '—'} />
        <StatTile label="Date of birth" value={p.d_o_b || '—'} />
        <StatTile label="Height" value={p.height ? `${(p.height * 100).toFixed(0)} cm` : '—'} />
        <StatTile label="Weight" value={p.weight ? `${p.weight.toFixed(0)} kg` : '—'} />
      </div>

      {rfaf.isLoading && <div className="text-slate-400">Loading season stats…</div>}
      {rfaf.error && (
        <div className="text-sm text-slate-500">
          Season stats unavailable: {(rfaf.error as Error).message}
        </div>
      )}
      {rfaf.data && <SeasonStats stats={rfaf.data.results} />}
    </div>
  );
}
