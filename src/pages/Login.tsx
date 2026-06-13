import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePlayer, usePlayers, useRfafSearch, useDeletePlayer } from '../api/hooks.js';
import { usePlayerContext } from '../api/PlayerContext.js';
import type { RfafSearchResult } from '../api/types.js';

export function Login() {
  const { data: players, isLoading: isPlayersLoading } = usePlayers();
  const createPlayer = useCreatePlayer();
  const deletePlayer = useDeletePlayer();
  const { setActivePlayerId } = usePlayerContext();
  const nav = useNavigate();

  // Onboarding state
  const [step, setStep] = useState<'search' | 'select' | 'nickname'>('search');
  const [fullName, setFullName] = useState('');
  const [nickname, setNickname] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<RfafSearchResult | null>(null);

  const { data: searchResults, isFetching: isSearching } = useRfafSearch(fullName, step === 'select');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 3) return;
    setStep('select');
  };

  const handleSelect = (p: RfafSearchResult) => {
    setSelectedPlayer(p);
    setNickname(p.name); // Pre-fill nickname with RFAF name
    setStep('nickname');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    try {
      const player = await createPlayer.mutateAsync({
        name: nickname,
        rfaf_player_id: selectedPlayer?.id,
        rfaf_own_player: selectedPlayer?.name,
      });
      setActivePlayerId(player.id);
      nav('/');
    } catch (_e) {
      alert('Failed to create player');
    }
  };

  const selectExistingPlayer = (id: number) => {
    setActivePlayerId(id);
    nav('/');
  };

  const handleDeletePlayer = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete profile "${name}"? This action cannot be undone.`)) return;
    try {
      await deletePlayer.mutateAsync(id);
    } catch (e) {
      alert('Failed to delete player');
    }
  };

  if (isPlayersLoading) return <div className="p-8 text-center text-slate-400">Loading…</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold text-slate-100 text-center mb-8">Footbar Stats</h1>

        <div className="bg-brand-panel border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-800/20">
            <h2 className="text-lg font-semibold text-slate-200">
              {step === 'search' && 'Get Started'}
              {step === 'select' && 'Select your RFAF profile'}
              {step === 'nickname' && 'One last thing'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {step === 'search' && 'Search your name in Universo RFAF to sync your stats.'}
              {step === 'select' && `Found ${searchResults?.length ?? 0} matches for "${fullName}"`}
              {step === 'nickname' && 'Choose a nickname for your local profile.'}
            </p>
          </div>

          {/* Step 1: Search */}
          {step === 'search' && (
            <form onSubmit={handleSearch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  autoFocus
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Erik Perez Garcia"
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                />
              </div>
              <button
                type="submit"
                disabled={fullName.trim().length < 3}
                className="w-full bg-slate-200 hover:bg-white text-slate-900 font-bold py-2 rounded-md transition-colors disabled:opacity-50"
              >
                Search RFAF
              </button>
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-brand-panel px-2 text-slate-600">or</span></div>
              </div>
              
              <button
                type="button"
                onClick={() => setStep('nickname')}
                className="w-full text-slate-400 hover:text-slate-200 text-sm py-1 transition-colors"
              >
                Skip search and create manually
              </button>
            </form>
          )}

          {/* Step 2: Select */}
          {step === 'select' && (
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
              {isSearching ? (
                <div className="p-8 text-center text-slate-500 italic animate-pulse">Searching...</div>
              ) : searchResults?.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-slate-400">No players found.</p>
                  <button 
                    onClick={() => setStep('search')}
                    className="text-brand text-sm mt-2 hover:underline"
                  >
                    Try a different name
                  </button>
                </div>
              ) : (
                searchResults?.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelect(p)}
                    className="w-full p-4 flex items-center gap-4 hover:bg-slate-800/50 transition-colors text-left"
                  >
                    {p.image ? (
                      <img src={p.image} className="w-12 h-12 rounded-full object-cover bg-slate-900 border border-slate-700" alt="" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold">
                        {p.name[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-slate-200">{p.name}</div>
                      <div className="text-xs text-slate-500">{p.team} • {p.category}</div>
                    </div>
                  </button>
                ))
              )}
              <div className="p-4 bg-slate-800/10">
                <button 
                  onClick={() => setStep('search')}
                  className="text-slate-500 text-xs hover:text-slate-300"
                >
                  ← Back to search
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Nickname */}
          {step === 'nickname' && (
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {selectedPlayer && (
                <div className="flex items-center gap-3 p-3 bg-brand/10 border border-brand/20 rounded-md mb-4">
                  <div className="text-brand text-xl">✓</div>
                  <div className="text-sm">
                    <div className="text-slate-300 font-medium">Linked to RFAF</div>
                    <div className="text-slate-500 truncate">{selectedPlayer.name}</div>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Profile Nickname
                </label>
                <input
                  autoFocus
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="What should we call you?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                />
              </div>
              <button
                type="submit"
                disabled={!nickname.trim() || createPlayer.isPending}
                className="w-full bg-brand hover:bg-brand/90 text-white font-bold py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {createPlayer.isPending ? 'Creating...' : 'Create Profile'}
              </button>
              <button 
                type="button"
                onClick={() => setStep(selectedPlayer ? 'select' : 'search')}
                className="w-full text-slate-500 text-xs hover:text-slate-300"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Existing Players List */}
          {(players?.length ?? 0) > 0 && step === 'search' && (
            <div className="border-t border-slate-800">
              <div className="px-6 py-3 bg-slate-800/10 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Or select existing profile
              </div>
              <div className="divide-y divide-slate-800 max-h-48 overflow-y-auto">
                {players?.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-200">{p.name}</div>
                      <div className="flex gap-2 mt-1">
                        <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${p.footbar_user_id ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'bg-slate-800 text-slate-600 border border-slate-700'}`}>
                          Footbar
                        </span>
                        <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${p.rfaf_player_id ? 'bg-blue-900/30 text-blue-400 border border-blue-800/50' : 'bg-slate-800 text-slate-600 border border-slate-700'}`}>
                          RFAF
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeletePlayer(p.id, p.name)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-all"
                        title="Delete Profile"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => selectExistingPlayer(p.id)}
                        className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
