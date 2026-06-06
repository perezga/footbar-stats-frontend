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
  const played = fixture.our_goals !== null && fixture.their_goals !== null;
  const ourTeam = fixture.is_home ? fixture.home : fixture.away;

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <ResultBadge result={fixture.result} />
        <span className="font-mono text-slate-100">
          {played ? `${fixture.our_goals} - ${fixture.their_goals}` : 'vs'}
        </span>
        <span className="text-slate-400 truncate">{fixture.opponent}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-brand-panel border border-slate-800 p-4">
      <div className="flex items-center gap-3">
        <ResultBadge result={fixture.result} />
        <div className="flex items-center gap-3 text-lg">
          <span className="font-semibold text-slate-100">{ourTeam}</span>
          <span className="font-mono text-slate-100">
            {played ? `${fixture.our_goals} - ${fixture.their_goals}` : 'vs'}
          </span>
          <span className="text-slate-300">{fixture.opponent}</span>
        </div>
      </div>
      <div className="mt-2 text-xs text-slate-400">
        Jornada {fixture.matchday} · {fixture.is_home ? 'Local' : 'Visitante'}
        {fixture.result && ` · ${RESULT_LABEL[fixture.result]}`}
      </div>
    </div>
  );
}
