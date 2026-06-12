import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useAuthStatus,
  useFixtures,
  usePlayerStats,
  useRefreshRfaf,
  useScorers,
  useSeasons,
  useStandings,
} from '../api/hooks.js';
import { ErrorAlert } from '../components/ErrorAlert.js';
import { StatTile } from '../components/StatTile.js';

export function League() {
  const { data: auth } = useAuthStatus();
  const seasons = useSeasons();
  const [season, setSeason] = useState('');

  const standings = useStandings(true, season);
  const scorers = useScorers(true, season);
  const fixtures = useFixtures(true, season);
  const stats = usePlayerStats(!!auth?.links.rfaf, season);
  const refresh = useRefreshRfaf();

  const activeSeason = season || seasons.data?.current || '';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-black text-white">Liga</h1>
        <div className="flex items-center gap-3">
          <select
            value={activeSeason}
            onChange={(e) => setSeason(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm font-bold text-slate-200 outline-none focus:border-brand"
          >
            {seasons.data?.results.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => refresh.mutate(activeSeason)}
            disabled={refresh.isPending}
            className="text-sm font-bold text-brand hover:underline disabled:opacity-50"
          >
            {refresh.isPending ? 'Sincronizando…' : 'Sincronizar'}
          </button>
        </div>
      </div>

      {!auth?.links.rfaf && (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Track your league goals</h3>
          <p className="text-sm text-slate-400 max-w-xs mb-4">
            Link your RFAF player ID to see your personal stats in this league.
          </p>
          <Link to="/" className="text-brand text-sm font-bold hover:underline">
            Link RFAF Profile
          </Link>
        </div>
      )}

      {stats.data && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
          <div className="mb-4 flex items-baseline justify-between border-b border-slate-700/50 pb-4">
            <h2 className="text-lg font-bold text-slate-100">MIS ESTADÍSTICAS</h2>
            <div className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              {stats.data.results.team}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.data.results.stats.map((st) => (
              <StatTile key={st.name} label={st.name} value={st.value} compact />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Clasificación */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-white">Clasificación</h2>
          {standings.error && (
            <ErrorAlert error={standings.error} onRetry={() => standings.refetch()} />
          )}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400">
                  <th className="px-4 py-2 font-bold">#</th>
                  <th className="px-4 py-2 font-bold">Equipo</th>
                  <th className="px-4 py-2 text-center font-bold">PJ</th>
                  <th className="px-4 py-2 text-center font-bold">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {standings.isLoading &&
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="h-10 px-4" />
                    </tr>
                  ))}
                {standings.data?.results.map((r) => (
                  <tr
                    key={r.equipo}
                    className={`transition-colors hover:bg-slate-800/50 ${r.own ? 'bg-brand/10' : ''}`}
                  >
                    <td className="px-4 py-2.5 font-bold text-slate-400">{r.posicion}</td>
                    <td className="px-4 py-2.5 font-bold text-slate-100">{r.equipo}</td>
                    <td className="px-4 py-2.5 text-center text-slate-300">{r.jugados}</td>
                    <td className="px-4 py-2.5 text-center font-black text-white">{r.puntos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Goleadores */}
        <section>
          <h2 className="mb-4 text-xl font-bold text-white">Goleadores</h2>
          {scorers.error && <ErrorAlert error={scorers.error} onRetry={() => scorers.refetch()} />}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400">
                  <th className="px-4 py-2 font-bold">Jugador</th>
                  <th className="px-4 py-2 text-right font-bold">Goles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {scorers.isLoading &&
                  [...Array(10)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={2} className="h-10 px-4" />
                    </tr>
                  ))}
                {scorers.data?.results.map((r) => (
                  <tr
                    key={`${r.player}-${r.team}`}
                    className={`transition-colors hover:bg-slate-800/50 ${r.own ? 'bg-brand/10' : ''}`}
                  >
                    <td className="px-4 py-2.5">
                      <div className="font-bold text-slate-100">{r.player}</div>
                      <div className="text-xs font-medium text-slate-500">{r.team}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-black text-brand">{r.goals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Calendario */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">Calendario</h2>
        {fixtures.error && <ErrorAlert error={fixtures.error} onRetry={() => fixtures.refetch()} />}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fixtures.isLoading &&
            [...Array(6)].map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-800/50" />
            ))}
          {fixtures.data?.results.map((f) => (
            <div
              key={`${f.matchday}-${f.home}-${f.away}`}
              className="flex flex-col justify-center rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700"
            >
              <div className="mb-2 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Jornada {f.matchday}</span>
                <span>{f.date || 'TBD'}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="truncate font-bold text-slate-200">{f.home}</span>
                  <span className="font-black text-white">{f.home_goals ?? '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="truncate font-bold text-slate-200">{f.away}</span>
                  <span className="font-black text-white">{f.away_goals ?? '-'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
