import { useState } from 'react';
import {
  useAuthStatus,
  useLevel,
  useLinkRfaf,
  usePlayerStats,
  useProfile,
  useRecords,
  useScorers,
  useSessions,
  useUnlinkFootbar,
} from '../api/hooks.js';
import { ErrorAlert } from '../components/ErrorAlert.js';
import { MatchHero } from '../components/MatchHero.js';
import { PlayerCard } from '../components/PlayerCard.js';
import { PlayerLevelCard } from '../components/PlayerLevelCard.js';
import { StatTile } from '../components/StatTile.js';

const FOOT_LABEL: Record<string, string> = { r: 'Right', l: 'Left', b: 'Both', n: 'None' };

function AccountSettings() {
  const { data: auth } = useAuthStatus();
  const unlinkFootbar = useUnlinkFootbar();
  const [rfafId, setRfafId] = useState('');
  const linkRfaf = useLinkRfaf();

  if (!auth) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
        <h2 className="text-xl font-bold text-slate-100 mb-4">Connections</h2>

        <div className="space-y-4">
          {/* Footbar Connection */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${auth.links.footbar ? 'bg-green-500' : 'bg-slate-600'}`}
              />
              <div>
                <div className="font-bold text-slate-200">Footbar Tracker</div>
                <div className="text-xs text-slate-400">
                  {auth.links.footbar ? 'Connected and syncing sessions' : 'Not connected'}
                </div>
              </div>
            </div>
            {auth.links.footbar ? (
              <button
                onClick={() => unlinkFootbar.mutate()}
                className="text-sm font-bold text-red-500 hover:text-red-400 transition-colors"
                disabled={unlinkFootbar.isPending}
              >
                {unlinkFootbar.isPending ? 'Unlinking...' : 'Disconnect'}
              </button>
            ) : (
              <a
                href="/auth/footbar/link"
                className="text-sm font-bold text-brand hover:text-brand/80 transition-colors"
              >
                Connect Footbar
              </a>
            )}
          </div>

          {/* RFAF Connection */}
          <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${auth.links.rfaf ? 'bg-green-500' : 'bg-slate-600'}`}
                />
                <div>
                  <div className="font-bold text-slate-200">Universo RFAF</div>
                  <div className="text-xs text-slate-400">
                    {auth.links.rfaf ? 'Linked to player ID' : 'Not linked'}
                  </div>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (rfafId.trim())
                  linkRfaf.mutate(rfafId.trim(), { onSuccess: () => setRfafId('') });
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={rfafId}
                onChange={(e) => setRfafId(e.target.value)}
                placeholder={
                  auth.links.rfaf ? 'Change player ID...' : 'Enter player ID (e.g. 123456)'
                }
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand outline-none"
              />
              <button
                type="submit"
                disabled={linkRfaf.isPending || !rfafId.trim()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {linkRfaf.isPending ? 'Linking...' : 'Update'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Profile() {
  const { data: auth } = useAuthStatus();
  const q = useProfile(!!auth?.links.footbar);
  const s = usePlayerStats(!!auth?.links.rfaf, '');
  const records = useRecords('11', !!auth?.links.footbar);
  const scorers = useScorers(!!auth?.links.rfaf, '');
  const matches = useSessions(
    { matchType: '11', includeFixtures: true, limit: 200 },
    !!auth?.links.footbar,
  );
  const level = useLevel(!!auth?.links.footbar);

  if (!auth) return null;

  const profile = q.data;
  const stats = s.data?.results;
  const scorer = scorers.data?.results.find((c) => c.own);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="h-28 w-28 shrink-0 rounded-full border-4 border-slate-800 bg-slate-900 flex items-center justify-center overflow-hidden shadow-lg">
          {profile?.profile_pic ? (
            <img src={profile.profile_pic} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl font-black text-slate-700">
              {(auth.user?.nickname || auth.user?.email || '?')[0]?.toUpperCase()}
            </span>
          )}
        </div>
        <div className="text-center sm:pt-2 sm:text-left">
          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            {profile?.nickname || auth.user?.nickname || auth.user?.email?.split('@')[0]}
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">{auth.user?.email}</p>

          {profile && (
            <div className="mt-2.5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm font-medium text-slate-400 sm:justify-start">
              {profile.fav_position && (
                <span className="uppercase tracking-wider">{profile.fav_position}</span>
              )}
              {profile.fav_foot && (
                <span>{FOOT_LABEL[profile.fav_foot] ?? profile.fav_foot} foot</span>
              )}
              <span>{Math.round(profile.height)} cm</span>
              <span>{Math.round(profile.weight)} kg</span>
            </div>
          )}
        </div>
      </div>

      {level.data && <PlayerLevelCard data={level.data} />}

      {matches.data && <MatchHero matches={matches.data.results} />}

      {auth.links.footbar && profile && (
        <PlayerCard
          profile={profile}
          stats={stats}
          scorer={scorer}
          records={records.data?.records ?? []}
          matches={matches.data?.results ?? []}
        />
      )}

      <AccountSettings />

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
