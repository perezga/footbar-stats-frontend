import { useMemo, useState } from 'react';
import {
  useFixtures,
  useRefreshRfaf,
  useScorers,
  useStandings,
} from '../api/hooks.js';
import type { Fixture, RfafForm, Scorer, Standing } from '../api/types.js';
import { formatDate } from '../lib/units.js';

type Tab = 'standings' | 'fixtures' | 'scorers';
const TABS: { id: Tab; label: string }[] = [
  { id: 'standings', label: 'Standings' },
  { id: 'fixtures', label: 'Fixtures' },
  { id: 'scorers', label: 'Top scorers' },
];

const FORM_STYLE: Record<RfafForm, string> = {
  W: 'bg-green-600',
  D: 'bg-yellow-500',
  L: 'bg-red-600',
};

function FormBadges({ form }: { form: RfafForm[] }) {
  return (
    <span className="inline-flex gap-0.5">
      {form.map((r, i) => (
        <span
          key={i}
          className={`inline-flex h-4 w-4 items-center justify-center rounded-sm text-[10px] font-bold text-white ${FORM_STYLE[r]}`}
        >
          {r}
        </span>
      ))}
    </span>
  );
}

const ownRow = (own?: boolean) =>
  own ? 'bg-brand/20 text-slate-100 font-semibold' : 'hover:bg-slate-800/40';

function StandingsTable({ rows }: { rows: Standing[] }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-brand-panel border border-slate-800">
      <table className="w-full text-sm">
        <thead className="text-slate-400 border-b border-slate-800">
          <tr className="text-left">
            <th className="px-3 py-2 w-8">#</th>
            <th className="px-3 py-2">Team</th>
            <th className="px-2 py-2 text-center">Pts</th>
            <th className="px-2 py-2 text-center">PJ</th>
            <th className="px-2 py-2 text-center">W</th>
            <th className="px-2 py-2 text-center">D</th>
            <th className="px-2 py-2 text-center">L</th>
            <th className="px-2 py-2 text-center">GF</th>
            <th className="px-2 py-2 text-center">GA</th>
            <th className="px-2 py-2 text-center">+/−</th>
            <th className="px-3 py-2">Form</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((s) => (
            <tr key={s.position} className={ownRow(s.own)}>
              <td className="px-3 py-2 text-slate-400">{s.position}</td>
              <td className="px-3 py-2">{s.team}</td>
              <td className="px-2 py-2 text-center font-semibold">{s.points}</td>
              <td className="px-2 py-2 text-center text-slate-400">{s.played}</td>
              <td className="px-2 py-2 text-center">{s.won}</td>
              <td className="px-2 py-2 text-center">{s.drawn}</td>
              <td className="px-2 py-2 text-center">{s.lost}</td>
              <td className="px-2 py-2 text-center">{s.goals_for}</td>
              <td className="px-2 py-2 text-center">{s.goals_against}</td>
              <td className="px-2 py-2 text-center text-slate-400">
                {s.goals_for - s.goals_against > 0 ? '+' : ''}
                {s.goals_for - s.goals_against}
              </td>
              <td className="px-3 py-2">
                <FormBadges form={s.form} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FixturesList({ rows, ownTeam }: { rows: Fixture[]; ownTeam: string | null }) {
  const isOurs = (name: string) => !!ownTeam && name === ownTeam;
  return (
    <div className="rounded-xl bg-brand-panel border border-slate-800 divide-y divide-slate-800">
      {rows.map((f) => {
        const played = f.home_goals !== null && f.away_goals !== null;
        return (
          <div key={f.matchday} className="flex items-center gap-3 px-4 py-3 text-sm">
            <div className="w-8 text-center text-xs text-slate-500">J{f.matchday}</div>
            <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <span className={`text-right ${isOurs(f.home) ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>
                {f.home}
              </span>
              <span className="px-2 font-mono text-slate-100">
                {played ? `${f.home_goals} - ${f.away_goals}` : 'vs'}
              </span>
              <span className={`${isOurs(f.away) ? 'font-semibold text-slate-100' : 'text-slate-300'}`}>
                {f.away}
              </span>
            </div>
            <div className="w-24 text-right text-xs text-slate-500">
              {f.date ? formatDate(f.date) : '—'}
              {f.result && (
                <span
                  className={`ml-2 inline-block h-4 w-4 rounded-sm text-center text-[10px] font-bold leading-4 text-white ${FORM_STYLE[f.result]}`}
                >
                  {f.result}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ScorersTable({ rows }: { rows: Scorer[] }) {
  return (
    <div className="overflow-x-auto rounded-xl bg-brand-panel border border-slate-800">
      <table className="w-full text-sm">
        <thead className="text-slate-400 border-b border-slate-800">
          <tr className="text-left">
            <th className="px-3 py-2 w-8">#</th>
            <th className="px-3 py-2">Player</th>
            <th className="px-3 py-2">Team</th>
            <th className="px-2 py-2 text-center">PJ</th>
            <th className="px-2 py-2 text-center">Goals</th>
            <th className="px-2 py-2 text-center">G/match</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {rows.map((s) => (
            <tr key={`${s.rank}-${s.player}`} className={ownRow(s.own)}>
              <td className="px-3 py-2 text-slate-400">{s.rank}</td>
              <td className="px-3 py-2">{s.player}</td>
              <td className="px-3 py-2 text-slate-400">{s.team}</td>
              <td className="px-2 py-2 text-center text-slate-400">{s.played}</td>
              <td className="px-2 py-2 text-center font-semibold">
                {s.goals}
                {s.penalties > 0 && (
                  <span className="ml-1 text-xs text-slate-500">({s.penalties}p)</span>
                )}
              </td>
              <td className="px-2 py-2 text-center text-slate-400">
                {s.goals_per_game.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function League() {
  const [tab, setTab] = useState<Tab>('standings');
  const standings = useStandings(true);
  const fixtures = useFixtures(tab === 'fixtures');
  const scorers = useScorers(tab === 'scorers');
  const refresh = useRefreshRfaf();

  const ownTeam = useMemo(
    () => standings.data?.results.find((s) => s.own)?.team ?? null,
    [standings.data],
  );

  const active = tab === 'standings' ? standings : tab === 'fixtures' ? fixtures : scorers;
  const lastSync = active.data?.fetched_at ? new Date(active.data.fetched_at) : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <nav className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-md text-sm ${
                tab === t.id ? 'bg-brand text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
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

      {active.isLoading && <div className="text-slate-400">Loading…</div>}
      {active.error && <div className="text-red-400">{(active.error as Error).message}</div>}

      {tab === 'standings' && standings.data && <StandingsTable rows={standings.data.results} />}
      {tab === 'fixtures' && fixtures.data && (
        <FixturesList rows={fixtures.data.results} ownTeam={ownTeam} />
      )}
      {tab === 'scorers' && scorers.data && <ScorersTable rows={scorers.data.results} />}
    </div>
  );
}
