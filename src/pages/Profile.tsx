import { useState } from 'react';
import {
  useLevel,
  usePlayerStats,
  useProfile,
  useRecords,
  useScorers,
  useSessions,
  useLinkRfaf,
} from '../api/hooks.js';
import type { PlayerStats } from '../api/types.js';
import { ErrorAlert } from '../components/ErrorAlert.js';
import { MatchHero } from '../components/MatchHero.js';
import { PlayerCard } from '../components/PlayerCard.js';
import { PlayerLevelCard } from '../components/PlayerLevelCard.js';
import { StatTile } from '../components/StatTile.js';

const FOOT_LABEL: Record<string, string> = { r: 'Right', l: 'Left', b: 'Both', n: 'None' };

function RfafLinkSection({ currentId }: { currentId: string | null | undefined }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(currentId ?? '');
  const link = useLinkRfaf();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!val.trim()) return;
    link.mutate(val.trim(), {
      onSuccess: () => setEditing(false),
    });
  };

  if (!editing && currentId) {
    return (
      <div className="mt-8 rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
        <h3 className="text-lg font-bold text-slate-100">RFAF Profile</h3>
        <p className="mt-1 text-sm text-slate-400">Linked to player ID: <span className="font-mono text-slate-300">{currentId}</span></p>
        <button
          onClick={() => setEditing(true)}
          className="mt-3 text-sm font-medium text-brand hover:underline"
        >
          Change ID
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
      <h3 className="text-lg font-bold text-slate-100">{currentId ? 'Change' : 'Link'} RFAF Profile</h3>
      <p className="mt-1 mb-4 text-sm text-slate-400">
        Enter your Universo RFAF player ID (<code>cod_player</code>) to sync your league matches and goals.
      </p>
      <form onSubmit={handleSave} className="flex gap-2">
        <input
          type="text"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="e.g. 123456"
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          disabled={link.isPending}
        />
        <button
          type="submit"
          disabled={link.isPending || !val.trim()}
          className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand/90 disabled:opacity-50"
        >
          {link.isPending ? 'Saving...' : 'Save'}
        </button>
        {editing && currentId && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-300 hover:bg-slate-700"
            disabled={link.isPending}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
}

export function Profile() {
  const q = useProfile(true);
  const s = usePlayerStats(true, '');
  const records = useRecords('11', true);
  const scorers = useScorers(true, '');
  const matches = useSessions({ matchType: '11', includeFixtures: true, limit: 200 }, true);
  const level = useLevel(true);
  if (q.isLoading) return <div className="text-slate-400">Loading…</div>;
  if (q.error) return <ErrorAlert error={q.error} onRetry={() => q.refetch()} />;
  if (!q.data) return null;

  const profile = q.data;
  const stats = s.data?.results;
  const scorer = scorers.data?.results.find((c) => c.own);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
        {profile.profile_pic && (
          <img
            src={profile.profile_pic}
            alt=""
            className="h-28 w-28 shrink-0 rounded-full border-4 border-slate-800 bg-slate-900 object-cover shadow-lg"
          />
        )}
        <div className="text-center sm:pt-2 sm:text-left">
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {profile.nickname || profile.first_name}
          </h1>
          <div className="mt-1.5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium text-slate-400 sm:justify-start">
            {profile.fav_position && (
              <span className="uppercase tracking-wider">{profile.fav_position}</span>
            )}
            {profile.fav_foot && (
              <span>{FOOT_LABEL[profile.fav_foot] ?? profile.fav_foot} foot</span>
            )}
            <span>{Math.round(profile.height)} cm</span>
            <span>{Math.round(profile.weight)} kg</span>
          </div>
        </div>
      </div>

      {level.data && <PlayerLevelCard data={level.data} />}

      {matches.data && <MatchHero matches={matches.data.results} />}

      <PlayerCard
        profile={profile}
        stats={stats}
        scorer={scorer}
        records={records.data?.records ?? []}
        matches={matches.data?.results ?? []}
      />

      <RfafLinkSection currentId={profile.rfaf_player_id} />

      {stats && (
        <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
          <div className="mb-4 flex items-baseline justify-between border-b border-slate-700/50 pb-4">
            <h2 className="text-lg font-bold text-slate-100">LIGA {stats.season}</h2>
            <div className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              {stats.team}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.stats.map((st) => (
              <StatTile key={st.name} label={st.name} value={st.value} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
