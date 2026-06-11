import { Link } from 'react-router-dom';
import type { PlayerMatchEvent, Position, SessionFixture } from '../api/types.js';
import { formatKickoff, positionLabel, RESULT_STYLE } from '../lib/units.js';

const RESULT_LABEL = { W: 'Victoria', D: 'Empate', L: 'Derrota' } as const;

const EVENT_ICON: Record<PlayerMatchEvent['kind'], string> = {
  goal: '⚽',
  yellow: '🟨',
  red: '🟥',
  second_yellow: '🟨🟥',
  other: '•',
};
const EVENT_LABEL: Record<PlayerMatchEvent['kind'], string> = {
  goal: 'Gol',
  yellow: 'Tarjeta amarilla',
  red: 'Tarjeta roja',
  second_yellow: 'Doble amarilla',
  other: 'Evento',
};

/** Inline icon+minute run (`⚽17' ⚽37'`) for embedding in one-line list rows. */
export function PlayerEventsInline({ events }: { events: PlayerMatchEvent[] }) {
  if (!events?.length) return null;
  return (
    <>
      {events.map((e, i) => (
        <span key={i} title={EVENT_LABEL[e.kind]} className="whitespace-nowrap">
          {i > 0 && ' '}
          {EVENT_ICON[e.kind]}
          {e.minute !== null && `${e.minute}’`}
        </span>
      ))}
    </>
  );
}

/** One leg (ida/vuelta) of a merged opponent row, ready to render as a sub-line. */
export interface FixtureLeg {
  label: 'Ida' | 'Vuelta';
  sessionId: number | null;
  fixture: SessionFixture;
  position?: Position;
  scoreStars?: number;
}

/**
 * Sub-line with one leg's details under a merged opponent row: result and
 * score (or `pendiente`), kickoff, matchday, venue, player events and stars.
 * Links to the leg's session when the tracker recorded it.
 */
export function FixtureLegLine({ leg }: { leg: FixtureLeg }) {
  const f = leg.fixture;
  const played = f.home_goals !== null && f.away_goals !== null;
  const content = (
    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
      <span className="w-12 shrink-0 font-medium text-slate-300">{leg.label}</span>
      {played ? (
        <span className="flex shrink-0 items-center gap-2">
          <ResultBadge result={f.result} />
          <span className="font-mono text-slate-100">
            {f.our_goals} - {f.their_goals}
          </span>
        </span>
      ) : (
        <span className="shrink-0 italic text-slate-500">pendiente</span>
      )}
      <span className="overflow-hidden text-ellipsis whitespace-nowrap">
        {formatKickoff(f.date, f.time)} · J{f.matchday} · {f.is_home ? 'Local' : 'Visitante'}
        {leg.position && <> · {positionLabel(leg.position)}</>}
        {f.started === true && <> · Titular</>}
        {f.captain && (
          <span title="Capitán" className="font-bold text-amber-400">
            {' '}
            · ©
          </span>
        )}
        {f.events.length > 0 && (
          <>
            {' · '}
            <PlayerEventsInline events={f.events} />
          </>
        )}
        {typeof leg.scoreStars === 'number' && (
          <span className="text-brand"> · ★ {leg.scoreStars.toFixed(1)}</span>
        )}
      </span>
      <span
        title={leg.sessionId !== null ? 'Estadísticas Footbar disponibles' : 'Sin estadísticas Footbar'}
        className={leg.sessionId !== null ? 'ml-auto text-sm' : 'ml-auto text-sm opacity-25 grayscale'}
      >
        📊
      </span>
    </div>
  );
  return leg.sessionId !== null ? (
    <Link
      to={`/sessions/${leg.sessionId}`}
      className="-mx-2 block rounded-md px-2 hover:bg-slate-800/40"
    >
      {content}
    </Link>
  ) : (
    content
  );
}

/** The player's own events in the match, as minute-stamped chips. */
function PlayerEvents({ events }: { events: PlayerMatchEvent[] }) {
  if (!events?.length) return null;
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-slate-500">Jugador:</span>
      {events.map((e, i) => (
        <span
          key={i}
          title={EVENT_LABEL[e.kind]}
          className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-slate-200"
        >
          {EVENT_ICON[e.kind]}
          {e.minute !== null && <span className="text-slate-400">{e.minute}&rsquo;</span>}
        </span>
      ))}
    </div>
  );
}

function ResultBadge({ result }: { result: SessionFixture['result'] }) {
  if (!result) return null;
  return (
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded-sm px-1 text-xs font-bold text-white ${RESULT_STYLE[result]}`}
      title={RESULT_LABEL[result]}
    >
      {result}
    </span>
  );
}

/**
 * Official RFAF match result attached to a session. `compact` renders a single
 * line for list rows; the full form adds the matchday/venue context line.
 */
export function MatchResult({ fixture, compact }: { fixture: SessionFixture; compact?: boolean }) {
  const played = fixture.home_goals !== null && fixture.away_goals !== null;
  // Score follows the fixture name order: home on the left, away on the right —
  // so the player's goals land on whichever side their team plays.
  const score = played ? `${fixture.home_goals} - ${fixture.away_goals}` : 'vs';

  if (compact) {
    // List rows show only the opponent's name, so the score is from the
    // tracked team's perspective: our goals first, always.
    const ourScore = played ? `${fixture.our_goals} - ${fixture.their_goals}` : 'vs';
    return (
      <div className="flex items-center gap-2 text-sm">
        <ResultBadge result={fixture.result} />
        <span className="font-mono text-slate-100">{ourScore}</span>
      </div>
    );
  }

  const homeClass = fixture.is_home ? 'font-semibold text-slate-100' : 'text-slate-300';
  const awayClass = fixture.is_home ? 'text-slate-300' : 'font-semibold text-slate-100';
  return (
    <div className="rounded-xl bg-brand-panel border border-slate-800 p-4">
      <div className="flex items-center gap-3">
        <ResultBadge result={fixture.result} />
        <div className="flex items-center gap-3 text-lg">
          <span className={homeClass}>{fixture.home}</span>
          <span className="font-mono text-slate-100">{score}</span>
          <span className={awayClass}>{fixture.away}</span>
        </div>
        {fixture.captain && (
          <span
            title="Capitán"
            className="rounded bg-amber-500/20 px-1.5 text-xs font-bold text-amber-400"
          >
            ©
          </span>
        )}
      </div>
      <div className="mt-2 text-xs text-slate-400">
        Jornada {fixture.matchday} · {fixture.is_home ? 'Local' : 'Visitante'}
        {fixture.result && ` · ${RESULT_LABEL[fixture.result]}`}
        {fixture.started !== undefined && ` · ${fixture.started ? 'Titular' : 'Suplente'}`}
      </div>
      <PlayerEvents events={fixture.events} />
    </div>
  );
}
