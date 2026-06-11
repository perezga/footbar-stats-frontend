import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { MatchListItem, SessionFixture } from '../api/types.js';
import {
  countdownLabel,
  daysUntil,
  formatKickoff,
  madridInstantMs,
  matchWindow,
} from '../lib/units.js';
import { MatchResult } from './MatchResult.js';

interface FlatFixture {
  fixture: SessionFixture;
  sessionId: number | null;
}

/** Flatten primary rows + other_leg so merged ida/vuelta pairs both count. */
function flattenFixtures(rows: MatchListItem[]): FlatFixture[] {
  return rows.flatMap((r) => {
    const out: FlatFixture[] = [];
    if (r.fixture) out.push({ fixture: r.fixture, sessionId: r.id });
    if (r.other_leg) out.push({ fixture: r.other_leg.fixture, sessionId: r.other_leg.session_id });
    return out;
  });
}

/** When the match is over: kickoff window end, or end of day if no time. */
function fixtureEndMs(f: SessionFixture): number {
  return matchWindow(f.date, f.time)?.end ?? madridInstantMs(f.date!, '23:59');
}

/** Hero cards for the Profile page: next upcoming fixture and last result. */
export function MatchHero({ matches }: { matches: MatchListItem[] }) {
  const { next, last } = useMemo(() => {
    const all = flattenFixtures(matches);
    const upcoming = all
      .filter((x) => x.fixture.result === null && x.fixture.date !== null)
      .filter((x) => fixtureEndMs(x.fixture) > Date.now())
      .sort((a, b) => fixtureEndMs(a.fixture) - fixtureEndMs(b.fixture));
    const played = all
      .filter((x) => x.fixture.result !== null && x.fixture.date !== null)
      .sort((a, b) =>
        `${b.fixture.date}T${b.fixture.time ?? ''}`.localeCompare(
          `${a.fixture.date}T${a.fixture.time ?? ''}`,
        ),
      );
    return { next: upcoming[0] ?? null, last: played[0] ?? null };
  }, [matches]);

  if (!next && !last) return null;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {next && (
        <div className="rounded-xl bg-brand-panel border border-slate-800 p-4">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-wider text-slate-400">Próximo partido</div>
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">
              {countdownLabel(daysUntil(next.fixture.date!))}
            </span>
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-100">{next.fixture.opponent}</div>
          <div className="mt-1 text-sm text-slate-400">
            Jornada {next.fixture.matchday} · {next.fixture.is_home ? 'Local' : 'Visitante'}
          </div>
          <div className="text-sm text-slate-400">
            {formatKickoff(next.fixture.date, next.fixture.time)}
          </div>
        </div>
      )}
      {last && (
        <div className="space-y-1">
          <div className="px-1 text-xs uppercase tracking-wider text-slate-400">Último partido</div>
          <MatchResult fixture={last.fixture} />
          {last.sessionId !== null && (
            <Link
              to={`/sessions/${last.sessionId}`}
              className="inline-block px-1 text-sm text-brand hover:underline"
            >
              Ver estadísticas →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
