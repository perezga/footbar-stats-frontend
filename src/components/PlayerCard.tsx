import type { MatchListItem, PlayerStats, Profile, RecordEntry, Scorer } from '../api/types.js';

interface Props {
  profile: Profile;
  /** RFAF season stats (goals, matches). */
  stats?: PlayerStats | undefined;
  /** The player's own row in the league scorers table. */
  scorer?: Scorer | undefined;
  /** Footbar match records (sprint/shot speed, distance…). */
  records: RecordEntry[];
  /** Merged matches feed; player events feed the achievements. */
  matches: MatchListItem[];
}

function record(records: RecordEntry[], re: RegExp): number | undefined {
  return records.find((r) => re.test(r.metric))?.value;
}

const MEDAL = ['🥇', '🥈', '🥉'];

export function PlayerCard({ profile, stats, scorer, records, matches }: Props) {
  const line = (name: string) => stats?.stats.find((s) => s.name === name)?.value;
  const goals = line('Total Goles') ?? scorer?.goals;
  const played = line('Jugados') ?? scorer?.played;
  const perGame = goals !== undefined && played ? goals / played : scorer?.goals_per_game;
  const sprint = record(records, /sprint speed/i); // m/s
  const shot = record(records, /shot speed/i); // m/s
  const distance = record(records, /longest distance/i); // m

  // Achievements from the player's per-match goal events.
  const goalsByMatch = matches
    .filter((m) => m.fixture)
    .map((m) => m.fixture!.events.filter((e) => e.kind === 'goal').length);
  const hatTricks = goalsByMatch.filter((n) => n >= 3).length;
  const bestMatch = goalsByMatch.length > 0 ? Math.max(...goalsByMatch) : 0;

  // Playful FIFA-style overall: driven by the league scorer ranking.
  const ovr = scorer ? Math.max(50, 100 - scorer.rank) : null;
  const position = profile.fav_position ? profile.fav_position.toUpperCase() : '—';
  const photo = stats?.photo_url ?? profile.profile_pic;
  const name = (profile.first_name || profile.nickname).toUpperCase();

  const cardStats: { label: string; value: string; unit?: string }[] = [
    { label: 'GOL', value: goals !== undefined ? String(goals) : '—' },
    { label: 'PJ', value: played !== undefined ? String(played) : '—' },
    { label: 'G/P', value: perGame !== undefined ? perGame.toFixed(1) : '—' },
    { label: 'VEL', value: sprint !== undefined ? (sprint * 3.6).toFixed(1) : '—', unit: 'km/h' },
    { label: 'TIR', value: shot !== undefined ? (shot * 3.6).toFixed(0) : '—', unit: 'km/h' },
    {
      label: 'DIS',
      value: distance !== undefined ? (distance / 1000).toFixed(1) : '—',
      unit: 'km',
    },
  ];

  const achievements = [
    scorer &&
      `${MEDAL[scorer.rank - 1] ?? '🏅'} ${scorer.rank}º máximo goleador de la liga (${scorer.group})`,
    hatTricks > 0 && `🎩 ${hatTricks} hat-trick${hatTricks > 1 ? 's' : ''} esta temporada`,
    bestMatch >= 2 && `🔥 Mejor partido: ${bestMatch} goles`,
  ].filter((a): a is string => Boolean(a));

  return (
    <div className="mx-auto w-72 rounded-[1.5rem] bg-gradient-to-b from-amber-200 via-yellow-500 to-amber-700 p-[3px] shadow-xl shadow-amber-900/30">
      <div className="rounded-[calc(1.5rem-3px)] bg-gradient-to-b from-yellow-300 via-amber-400 to-yellow-600 px-5 pb-4 pt-4 text-amber-950">
        <div className="flex items-start justify-between">
          <div className="flex flex-col items-center leading-none">
            <div className="text-5xl font-black">{ovr ?? stats?.dorsal ?? '—'}</div>
            <div className="mt-1 text-lg font-bold tracking-widest">{position}</div>
            {profile.country_flag && (
              <img
                src={profile.country_flag}
                alt=""
                className="mt-2 h-5 w-8 rounded-sm object-cover ring-1 ring-amber-900/30"
              />
            )}
            {stats?.dorsal !== null && stats?.dorsal !== undefined && (
              <div className="mt-2 text-sm font-bold">#{stats.dorsal}</div>
            )}
          </div>
          {photo && (
            <img
              src={photo}
              alt=""
              className="h-32 w-32 rounded-xl object-cover object-top drop-shadow-lg"
            />
          )}
        </div>

        <div className="mt-3 border-y-2 border-amber-900/20 py-1.5 text-center text-xl font-extrabold tracking-wider">
          {name}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5">
          {cardStats.map((s) => (
            <div key={s.label} className="flex items-baseline justify-between">
              <span className="text-sm font-bold tracking-wide text-amber-900/80">{s.label}</span>
              <span className="text-lg font-extrabold">
                {s.value}
                {s.unit && <span className="ml-1 text-[10px] font-semibold">{s.unit}</span>}
              </span>
            </div>
          ))}
        </div>

        {achievements.length > 0 && (
          <div className="mt-3 space-y-1 border-t-2 border-amber-900/20 pt-2">
            {achievements.map((a) => (
              <div key={a} className="text-[11px] font-semibold leading-snug">
                {a}
              </div>
            ))}
          </div>
        )}

        {stats && (
          <div className="mt-3 text-center text-[10px] font-bold uppercase tracking-wider text-amber-900/70">
            {stats.team} · {stats.season}
          </div>
        )}
      </div>
    </div>
  );
}
