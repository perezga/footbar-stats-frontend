import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRefreshSessions, useSessions } from '../api/hooks.js';
import type { MatchType } from '../api/types.js';
import {
  FixtureLegLine,
  MatchResult,
  PlayerEventsInline,
  type FixtureLeg,
} from '../components/MatchResult.js';
import { MatchTypeFilter } from '../components/MatchTypeFilter.js';
import { formatDateTime, formatKickoff, MATCH_TYPE_LABEL, positionLabel } from '../lib/units.js';

const PAGE_SIZE = 25;

export function Sessions() {
  const [matchType, setMatchType] = useState<MatchType | undefined>(undefined);
  const [page, setPage] = useState(0);
  const q = useSessions(
    { matchType, limit: PAGE_SIZE, offset: page * PAGE_SIZE, includeFixtures: true },
    true,
  );
  const refresh = useRefreshSessions();

  const total = q.data?.count ?? 0;
  const lastSync = q.data?.last_sync ? new Date(q.data.last_sync) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <MatchTypeFilter
          value={matchType}
          onChange={(v) => {
            setMatchType(v);
            setPage(0);
          }}
        />
        <div className="ml-auto flex items-center gap-3 text-sm text-slate-400">
          {lastSync && <span>Synced {lastSync.toLocaleTimeString()}</span>}
          <button
            type="button"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending}
            className="px-3 py-1 rounded-md border border-slate-700 hover:border-slate-500 disabled:opacity-50"
          >
            {refresh.isPending ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {q.isLoading && <div className="text-slate-400">Loading…</div>}
      {q.error && <div className="text-red-400">{(q.error as Error).message}</div>}

      <div className="rounded-xl bg-brand-panel border border-slate-800 divide-y divide-slate-800">
        {q.data?.results.map((s) => {
          if (s.other_leg && s.fixture) {
            // Merged league pair: opponent header plus one sub-line per leg,
            // positioned in the date-descending feed by the row's own date.
            const thisLeg: FixtureLeg = {
              label: s.leg === 2 ? 'Vuelta' : 'Ida',
              sessionId: s.id,
              fixture: s.fixture,
              position: s.position,
              scoreStars: s.score_stars,
            };
            const otherLeg: FixtureLeg = {
              label: s.leg === 2 ? 'Ida' : 'Vuelta',
              sessionId: s.other_leg.session_id,
              fixture: s.other_leg.fixture,
              position: s.other_leg.position,
              scoreStars: s.other_leg.score_stars,
            };
            const [ida, vuelta] =
              thisLeg.label === 'Ida' ? [thisLeg, otherLeg] : [otherLeg, thisLeg];
            return (
              <div key={s.id ?? `fixture-${s.start_date}`} className="px-4 py-3">
                <div className="truncate text-slate-100 font-medium">{s.fixture.opponent}</div>
                <FixtureLegLine leg={ida} />
                <FixtureLegLine leg={vuelta} />
              </div>
            );
          }
          const content = (
            <>
              <div className="flex items-center justify-between gap-4">
                <div className="truncate text-slate-100 font-medium">
                  {s.fixture ? s.fixture.opponent : s.title || 'Untitled'}
                </div>
                <div className="flex items-center gap-2">
                  {s.fixture && <MatchResult fixture={s.fixture} compact />}
                  <span
                    title={
                      s.id !== null
                        ? 'Estadísticas Footbar disponibles'
                        : 'Sin estadísticas Footbar'
                    }
                    className={s.id !== null ? 'text-sm' : 'text-sm opacity-25 grayscale'}
                  >
                    📊
                  </span>
                </div>
              </div>
              <div className="mt-0.5 overflow-hidden whitespace-nowrap text-ellipsis text-xs text-slate-400">
                {s.fixture
                  ? formatKickoff(s.fixture.date, s.fixture.time)
                  : formatDateTime(s.start_date)}{' '}
                · {MATCH_TYPE_LABEL[s.match_type]} · {positionLabel(s.position)}
                {s.fixture && s.fixture.events.length > 0 && (
                  <>
                    {' · '}
                    <PlayerEventsInline events={s.fixture.events} />
                  </>
                )}
                {typeof s.score_stars === 'number' && (
                  <span className="text-brand"> · ★ {s.score_stars.toFixed(1)}</span>
                )}
              </div>
            </>
          );
          return s.id !== null ? (
            <Link key={s.id} to={`/sessions/${s.id}`} className="block px-4 py-3 hover:bg-slate-800/40">
              {content}
            </Link>
          ) : (
            <div key={`fixture-${s.start_date}`} className="block px-4 py-3">
              {content}
            </div>
          );
        })}
        {q.data?.results.length === 0 && (
          <div className="px-4 py-6 text-slate-400 text-sm">No sessions match these filters.</div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-slate-400">
        <div>
          Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 rounded-md border border-slate-700 hover:border-slate-500 disabled:opacity-30"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={(page + 1) * PAGE_SIZE >= total}
            className="px-3 py-1 rounded-md border border-slate-700 hover:border-slate-500 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
