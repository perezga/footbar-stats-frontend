import type { SessionFixture } from '../api/types.js';
import { RESULT_STYLE } from '../lib/units.js';

const RESULT_LABEL = { W: 'Victoria', D: 'Empate', L: 'Derrota' } as const;

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
    // The event name (home vs away) is already shown as the session title, so the
    // row only needs the result: badge + score, no repeated team names.
    return (
      <div className="flex items-center gap-2 text-sm">
        <ResultBadge result={fixture.result} />
        <span className="font-mono text-slate-100">{score}</span>
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
      </div>
      <div className="mt-2 text-xs text-slate-400">
        Jornada {fixture.matchday} · {fixture.is_home ? 'Local' : 'Visitante'}
        {fixture.result && ` · ${RESULT_LABEL[fixture.result]}`}
      </div>
    </div>
  );
}
