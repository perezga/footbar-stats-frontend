import { useState, useEffect } from 'react';
import { usePlayers, useUpdatePlayer, useLogout } from '../api/hooks.js';
import { usePlayerContext } from '../api/PlayerContext.js';

export function PlayerSettings() {
  const { activePlayerId } = usePlayerContext();
  const { data: players } = usePlayers();
  const updatePlayer = useUpdatePlayer();
  const logout = useLogout();
  
  const player = players?.find(p => p.id === activePlayerId);
  
  const [formData, setFormData] = useState({
    name: '',
    rfaf_player_id: '',
    rfaf_season: '',
    rfaf_team_id: '',
    rfaf_group_id: '',
    rfaf_competition_id: '',
    rfaf_own_player: '',
    rfaf_own_team: '',
  });

  useEffect(() => {
    if (player) {
      setFormData({
        name: player.name || '',
        rfaf_player_id: player.rfaf_player_id || '',
        rfaf_season: player.rfaf_season || '',
        rfaf_team_id: player.rfaf_team_id?.toString() || '',
        rfaf_group_id: player.rfaf_group_id || '',
        rfaf_competition_id: player.rfaf_competition_id || '',
        rfaf_own_player: player.rfaf_own_player || '',
        rfaf_own_team: player.rfaf_own_team || '',
      });
    }
  }, [player]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePlayerId) return;
    
    try {
      await updatePlayer.mutateAsync({
        id: activePlayerId,
        ...formData,
        rfaf_team_id: formData.rfaf_team_id ? Number(formData.rfaf_team_id) : (null as any),
      });
      alert('Settings saved');
    } catch (e) {
      alert('Failed to save settings');
    }
  };

  const handleDisconnect = async () => {
    if (!activePlayerId) return;
    if (!confirm('Are you sure you want to disconnect Footbar?')) return;
    
    try {
      await logout.mutateAsync(activePlayerId);
    } catch (e) {
      alert('Failed to disconnect');
    }
  };

  if (!player) return <div className="p-8 text-slate-400">Loading player...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Player Settings: {player.name}</h1>
      
      <div className="space-y-8">
        <section className="bg-brand-panel border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">Basic Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="p-name" className="block text-sm font-medium text-slate-400 mb-1">Display Name</label>
              <input
                id="p-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200 focus:ring-brand focus:border-brand"
              />
            </div>
            
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-md font-medium text-slate-200 mb-3 text-blue-400">RFAF Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rfaf-p-id" className="block text-sm font-medium text-slate-400 mb-1">RFAF Player ID</label>
                  <input
                    id="rfaf-p-id"
                    type="text"
                    value={formData.rfaf_player_id}
                    onChange={(e) => setFormData({ ...formData, rfaf_player_id: e.target.value })}
                    placeholder="e.g. 35133353"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label htmlFor="rfaf-s-id" className="block text-sm font-medium text-slate-400 mb-1">RFAF Season ID</label>
                  <input
                    id="rfaf-s-id"
                    type="text"
                    value={formData.rfaf_season}
                    onChange={(e) => setFormData({ ...formData, rfaf_season: e.target.value })}
                    placeholder="e.g. 22"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label htmlFor="rfaf-own-p" className="block text-sm font-medium text-slate-400 mb-1">Own Player Name (RFAF)</label>
                  <input
                    id="rfaf-own-p"
                    type="text"
                    value={formData.rfaf_own_player}
                    onChange={(e) => setFormData({ ...formData, rfaf_own_player: e.target.value })}
                    placeholder="PEREZ GARCIA, ERIK"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label htmlFor="rfaf-own-t" className="block text-sm font-medium text-slate-400 mb-1">Own Team Name (RFAF)</label>
                  <input
                    id="rfaf-own-t"
                    type="text"
                    value={formData.rfaf_own_team}
                    onChange={(e) => setFormData({ ...formData, rfaf_own_team: e.target.value })}
                    placeholder="ATLETICO ESTACION"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-slate-200"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 italic">
                RFAF data is used for league standings, scorers, and goal records.
              </p>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={updatePlayer.isPending}
                className="bg-brand hover:bg-brand/90 text-white font-semibold px-6 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {updatePlayer.isPending ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </section>

        <section className="bg-red-900/10 border border-red-900/30 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-red-400 mb-2">Account Connection</h2>
          <p className="text-sm text-slate-400 mb-4">
            Manage your link to external platforms.
          </p>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-200">Footbar</div>
              <div className="text-xs text-slate-500">
                {player.footbar_user_id ? `Linked (User ID: ${player.footbar_user_id})` : 'Not linked'}
              </div>
            </div>
            {player.footbar_user_id ? (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-sm text-red-400 hover:text-red-300 font-medium px-4 py-2 border border-red-900/50 rounded-md hover:bg-red-900/20 transition-all"
              >
                Disconnect Footbar
              </button>
            ) : (
              <a
                href={`/auth/login?playerId=${player.id}`}
                className="bg-slate-200 hover:bg-white text-slate-900 text-sm font-semibold px-4 py-2 rounded-md"
              >
                Connect Footbar
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
