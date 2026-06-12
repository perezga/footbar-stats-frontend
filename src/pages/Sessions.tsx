import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStatus, useRefreshSessions, useSessions } from '../api/hooks.js';
import { ErrorAlert } from '../components/ErrorAlert.js';
import { MatchResult } from '../components/MatchResult.js';
import { MatchTypeFilter } from '../components/MatchTypeFilter.js';

export function Sessions() {
  const { data: auth } = useAuthStatus();
  const [matchType, setMatchType] = useState<any>(undefined);
  const q = useSessions({ matchType, includeFixtures: true, limit: 200 }, !!auth?.links.footbar);
  const refresh = useRefreshSessions();

  if (!auth?.links.footbar) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Connect your Footbar</h2>
        <p className="text-slate-400 max-w-sm mb-6">
          To see your performance sessions and track your progress, link your Footbar account.
        </p>
        <Link to="/" className="bg-brand text-white px-6 py-2 rounded-lg font-bold">
          Go to Profile
        </Link>
      </div>
    );
  }

  const results = q.data?.results ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Partidos</h1>
        <button
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending || q.isPlaceholderData}
          className="text-sm font-bold text-brand hover:underline disabled:opacity-50"
        >
          {refresh.isPending ? 'Sincronizando…' : 'Sincronizar'}
        </button>
      </div>

      <MatchTypeFilter value={matchType} onChange={setMatchType} />

      {q.error && <ErrorAlert error={q.error} onRetry={() => q.refetch()} />}

      <div className="grid gap-3">
        {q.isLoading && (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-800/50 rounded-xl" />
            ))}
          </div>
        )}
        {!q.isLoading && results.length === 0 && (
          <div className="py-12 text-center text-slate-500">No se encontraron partidos.</div>
        )}
        {results.map((m) => (
          <MatchResult key={m.id || m.start_date} match={m} />
        ))}
      </div>
    </div>
  );
}
