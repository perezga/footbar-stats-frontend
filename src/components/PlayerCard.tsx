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

/** FUT-style shield outline, mirrored around x=150 in a 300×446 viewBox. */
const SHIELD =
  'M150 0 C190 7 224 11 252 13 L264 25 L264 352 C264 371 253 383 235 392 ' +
  'L167 435 Q150 444 133 435 L65 392 C47 383 36 371 36 352 L36 25 L48 13 ' +
  'C76 11 110 7 150 0 Z';

/** Gold shield background: base gradient, glow behind the photo, glare bands. */
function ShieldBackground() {
  return (
    <svg viewBox="0 0 300 446" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="fut-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f9eec6" />
          <stop offset="0.4" stopColor="#eacf82" />
          <stop offset="0.75" stopColor="#cda646" />
          <stop offset="1" stopColor="#9c7a2c" />
        </linearGradient>
        <radialGradient id="fut-glow" cx="0.62" cy="0.3" r="0.55">
          <stop offset="0" stopColor="#fff8dc" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff8dc" stopOpacity="0" />
        </radialGradient>
        <clipPath id="fut-clip">
          <path d={SHIELD} />
        </clipPath>
      </defs>
      <path
        d={SHIELD}
        fill="url(#fut-gold)"
        stroke="#5c430f"
        strokeOpacity="0.6"
        strokeWidth="1.5"
      />
      <g clipPath="url(#fut-clip)">
        <ellipse cx="190" cy="125" rx="150" ry="125" fill="url(#fut-glow)" />
        <path d="M-20 90 L150 -40 L225 -40 L-20 150 Z" fill="#fff" opacity="0.08" />
        <path d="M120 480 L330 295 L330 350 L185 480 Z" fill="#fff" opacity="0.05" />
      </g>
      <path
        d={SHIELD}
        fill="none"
        stroke="#6b4d15"
        strokeOpacity="0.45"
        strokeWidth="2"
        transform="translate(150 223) scale(0.945) translate(-150 -223)"
      />
    </svg>
  );
}

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
    .map((m) => m.fixture?.events.filter((e) => e.kind === 'goal').length)
    .filter((n): n is number => n !== undefined);
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
  // FUT cards read top-to-bottom per column; the grid fills row-major.
  const columnOrder = [0, 3, 1, 4, 2, 5].flatMap((i) => cardStats[i] ?? []);

  const achievements = [
    scorer &&
      `${MEDAL[scorer.rank - 1] ?? '🏅'} ${scorer.rank}º máximo goleador de la liga (${scorer.group})`,
    hatTricks > 0 && `🎩 ${hatTricks} hat-trick${hatTricks > 1 ? 's' : ''} esta temporada`,
    bestMatch >= 2 && `🔥 Mejor partido: ${bestMatch} goles`,
  ].filter((a): a is string => Boolean(a));

  return (
    <div className="relative mx-auto aspect-[300/446] w-80 select-none font-card drop-shadow-[0_16px_28px_rgba(0,0,0,0.5)] transition-transform duration-300 hover:scale-[1.02]">
      <ShieldBackground />

      <div className="absolute inset-0 flex flex-col px-10 pb-14 pt-10 text-[#3a2b0e]">
        <div className="flex items-start">
          <div className="flex w-[4.5rem] shrink-0 flex-col items-center pt-3">
            <div className="text-5xl font-semibold leading-none">{ovr ?? stats?.dorsal ?? '—'}</div>
            <div className="mt-0.5 text-xl font-medium tracking-[0.15em]">{position}</div>
            <div className="my-2 h-px w-10 bg-[#6b4d15]/50" />
            {profile.country_flag && (
              <img
                src={profile.country_flag}
                alt=""
                className="h-5 w-8 rounded-[2px] object-cover shadow ring-1 ring-[#6b4d15]/40"
              />
            )}
            {stats?.dorsal !== null && stats?.dorsal !== undefined && (
              <>
                <div className="my-2 h-px w-10 bg-[#6b4d15]/50" />
                <div className="text-sm font-semibold">#{stats.dorsal}</div>
              </>
            )}
          </div>
          {photo && (
            <img
              src={photo}
              alt=""
              className="ml-auto h-40 w-36 object-cover object-top drop-shadow-[0_6px_10px_rgba(60,40,0,0.35)] [mask-image:linear-gradient(to_bottom,black_72%,transparent)]"
            />
          )}
        </div>

        <div className="mt-1 text-center">
          <div
            className={`uppercase leading-tight tracking-[0.1em] font-medium ${
              name.length > 12 ? 'text-xl' : 'text-[1.6rem]'
            }`}
          >
            {name}
          </div>
          <div className="mx-auto mt-1 h-px w-48 bg-gradient-to-r from-transparent via-[#6b4d15]/60 to-transparent" />
        </div>

        <div className="relative mx-auto mt-2 grid w-full grid-cols-2 gap-y-0.5">
          <div className="absolute bottom-1 left-1/2 top-1 w-px -translate-x-1/2 bg-[#6b4d15]/40" />
          {columnOrder.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2 px-5">
              <span className="w-9 text-right text-lg font-semibold tabular-nums leading-snug">
                {s.value}
              </span>
              <span className="text-xs font-medium tracking-[0.12em] text-[#4a370f]/90">
                {s.label}
                {s.unit && <span className="ml-1 text-[9px] normal-case">{s.unit}</span>}
              </span>
            </div>
          ))}
        </div>

        {achievements.length > 0 && (
          <div className="mt-2 space-y-0.5 text-center">
            {achievements.map((a) => (
              <div key={a} className="text-[10px] font-medium leading-snug tracking-wide">
                {a}
              </div>
            ))}
          </div>
        )}

        {stats && (
          <div className="mt-auto px-2 text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-[#4a370f]/80">
            {stats.team} · {stats.season}
          </div>
        )}
      </div>
    </div>
  );
}
